#!/usr/bin/env -S deno run --allow-net --allow-read

import { extname, posix } from "https://deno.land/std@0.188.0/path/mod.ts";
import { contentType } from "https://deno.land/std@0.188.0/media_types/content_type.ts";
import { serve, serveTls } from "https://deno.land/std@0.188.0/http/server.ts";
import { calculate, ifNoneMatch } from "https://deno.land/std@0.188.0/http/etag.ts";
import { isRedirectStatus, Status } from "https://deno.land/std@0.188.0/http/http_status.ts";
import { ByteSliceStream } from "https://deno.land/std@0.188.0/streams/byte_slice_stream.ts";
import { parse } from "https://deno.land/std@0.188.0/flags/mod.ts";
import { red } from "https://deno.land/std@0.188.0/fmt/colors.ts";
import { createCommonResponse } from "https://deno.land/std@0.188.0/http/util.ts";
import { VERSION } from "https://deno.land/std@0.188.0/version.ts";

interface EntryInfo {
  mode: string;
  size: string;
  url: string;
  name: string;
}

const ENV_PERM_STATUS =
  Deno.permissions.querySync?.({ name: "env", variable: "DENO_DEPLOYMENT_ID" })
    .state ?? "granted"; // for deno deploy
const DENO_DEPLOYMENT_ID = ENV_PERM_STATUS === "granted"
  ? Deno.env.get("DENO_DEPLOYMENT_ID")
  : undefined;
const HASHED_DENO_DEPLOYMENT_ID = DENO_DEPLOYMENT_ID
  ? calculate(DENO_DEPLOYMENT_ID, { weak: true })
  : undefined;

/**
 * parse range header.
 *
 * ```ts ignore
 * parseRangeHeader("bytes=0-100",   500); // => { start: 0, end: 100 }
 * parseRangeHeader("bytes=0-",      500); // => { start: 0, end: 499 }
 * parseRangeHeader("bytes=-100",    500); // => { start: 400, end: 499 }
 * parseRangeHeader("bytes=invalid", 500); // => null
 * ```
 *
 * Note: Currently, no support for multiple Ranges (e.g. `bytes=0-10, 20-30`)
 */
function parseRangeHeader(rangeValue: string, fileSize: number) {
  const rangeRegex = /bytes=(?<start>\d+)?-(?<end>\d+)?$/u;
  const parsed = rangeValue.match(rangeRegex);

  if (!parsed || !parsed.groups) {
    // failed to parse range header
    return null;
  }

  const { start, end } = parsed.groups;
  if (start !== undefined) {
    if (end !== undefined) {
      return { start: +start, end: +end };
    } else {
      return { start: +start, end: fileSize - 1 };
    }
  } else {
    if (end !== undefined) {
      // example: `bytes=-100` means the last 100 bytes.
      return { start: fileSize - +end, end: fileSize - 1 };
    } else {
      // failed to parse range header
      return null;
    }
  }
}

function serveNotFound(req: Request): Response {
  const modRegex = /^\/(?<mod>[a-z][a-z0-9-])$/u;
  const parsed = new URL(req.url).pathname.match(modRegex);
  const mod = parsed?.groups?.mod;
  if (!mod) {
    return createCommonResponse(Status.NotFound);
  }
  const html = `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <meta name="go-import" content="zestack.dev/${mod} git https://github.com/zestack/${mod}">
  <meta name="go-source" content="zestack.dev/${mod} https://github.com/zestack/${mod} https://github.com/zestack/${mod}/tree/main{/dir} https://github.com/zestack/${mod}/blob/main{/dir}/{file}#L{line}">
  <title>zestack.dev/${mod}</title>
</head>
<body>
  <a href="https://zestack.dev">https://zestack.dev</a>
</body>
</html>`;

  const headers = createBaseHeaders();
  headers.set("content-type", "text/html; charset=UTF-8");

  return createCommonResponse(Status.OK, html, { headers });
}

/** Interface for serveFile options. */
export interface ServeFileOptions {
  /** The algorithm to use for generating the ETag.
   *
   * @default {"SHA-256"}
   */
  etagAlgorithm?: AlgorithmIdentifier;
  /** An optional FileInfo object returned by Deno.stat. It is used for optimization purposes. */
  fileInfo?: Deno.FileInfo;
}

/**
 * Returns an HTTP Response with the requested file as the body.
 * @param req The server request context used to cleanup the file handle.
 * @param filePath Path of the file to serve.
 * @param algorithm
 * @param fileInfo
 */
async function serveFile(
  req: Request,
  filePath: string,
  { etagAlgorithm: algorithm, fileInfo }: ServeFileOptions = {},
): Promise<Response> {
  try {
    fileInfo ??= await Deno.stat(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await req.body?.cancel();
      return serveNotFound(req);
    } else {
      throw error;
    }
  }

  if (fileInfo.isDirectory) {
    await req.body?.cancel();
    return serveNotFound(req);
  }

  const headers = createBaseHeaders();

  // Set date header if access timestamp is available
  if (fileInfo.atime) {
    headers.set("date", fileInfo.atime.toUTCString());
  }

  const etag = fileInfo.mtime
    ? await calculate(fileInfo, { algorithm })
    : await HASHED_DENO_DEPLOYMENT_ID;

  // Set last modified header if last modification timestamp is available
  if (fileInfo.mtime) {
    headers.set("last-modified", fileInfo.mtime.toUTCString());
  }
  if (etag) {
    headers.set("etag", etag);
  }

  if (etag || fileInfo.mtime) {
    // If an `if-none-match` header is present and the value matches the tag or
    // if an `if-modified-since` header is present and the value is bigger than
    // the access timestamp value, then return 304
    const ifNoneMatchValue = req.headers.get("if-none-match");
    const ifModifiedSinceValue = req.headers.get("if-modified-since");
    if (
      (!ifNoneMatch(ifNoneMatchValue, etag)) ||
      (ifNoneMatchValue === null &&
        fileInfo.mtime &&
        ifModifiedSinceValue &&
        fileInfo.mtime.getTime() <
          new Date(ifModifiedSinceValue).getTime() + 1000)
    ) {
      return createCommonResponse(Status.NotModified, null, { headers });
    }
  }

  // Set mime-type using the file extension in filePath
  const contentTypeValue = contentType(extname(filePath));
  if (contentTypeValue) {
    headers.set("content-type", contentTypeValue);
  }

  const fileSize = fileInfo.size;

  const rangeValue = req.headers.get("range");

  // Handle range request
  // Note: Some clients add a Range header to all requests to limit the size of the response.
  // If the file is empty, ignore the range header and respond with a 200 rather than a 416.
  // https://github.com/golang/go/blob/0d347544cbca0f42b160424f6bc2458ebcc7b3fc/src/net/http/fs.go#L273-L276
  if (rangeValue && 0 < fileSize) {
    const parsed = parseRangeHeader(rangeValue, fileSize);

    // Returns 200 OK if parsing the range header fails
    if (!parsed) {
      // Set content length
      headers.set("content-length", `${fileSize}`);

      const file = await Deno.open(filePath);
      return createCommonResponse(Status.OK, file.readable, { headers });
    }

    // Return 416 Range Not Satisfiable if invalid range header value
    if (
      parsed.end < 0 ||
      parsed.end < parsed.start ||
      fileSize <= parsed.start
    ) {
      // Set the "Content-range" header
      headers.set("content-range", `bytes */${fileSize}`);

      return createCommonResponse(
        Status.RequestedRangeNotSatisfiable,
        undefined,
        { headers },
      );
    }

    // clamps the range header value
    const start = Math.max(0, parsed.start);
    const end = Math.min(parsed.end, fileSize - 1);

    // Set the "Content-range" header
    headers.set("content-range", `bytes ${start}-${end}/${fileSize}`);

    // Set content length
    const contentLength = end - start + 1;
    headers.set("content-length", `${contentLength}`);

    // Return 206 Partial Content
    const file = await Deno.open(filePath);
    await file.seek(start, Deno.SeekMode.Start);
    const sliced = file.readable.pipeThrough(new ByteSliceStream(0, contentLength - 1));
    return createCommonResponse(Status.PartialContent, sliced, { headers });
  }

  // Set content length
  headers.set("content-length", `${fileSize}`);

  const file = await Deno.open(filePath);
  return createCommonResponse(Status.OK, file.readable, { headers });
}

function serveFallback(req: Request, maybeError: unknown): Response {
  if (maybeError instanceof URIError) {
    return createCommonResponse(Status.BadRequest);
  }

  if (maybeError instanceof Deno.errors.NotFound) {
    return serveNotFound(req);
  }

  return createCommonResponse(Status.InternalServerError);
}

function serverLog(req: Request, status: number) {
  const d = new Date().toISOString();
  const dateFmt = `[${d.slice(0, 10)} ${d.slice(11, 19)}]`;
  const url = new URL(req.url);
  const s = `${dateFmt} [${req.method}] ${url.pathname}${url.search} ${status}`;
  // using console.debug instead of console.log so chrome inspect users can hide request logs
  console.debug(s);
}

function createBaseHeaders(): Headers {
  return new Headers({
    server: "deno",
    // Set "accept-ranges" so that the client knows it can make range requests on future requests
    "accept-ranges": "bytes",
  });
}

/** Interface for serveDir options. */
export interface ServeDirOptions {
  /** Serves the files under the given directory root. Defaults to your current directory.
   *
   * @default {"."}
   */
  fsRoot?: string;
  /** Specified that part is stripped from the beginning of the requested pathname.
   *
   * @default {undefined}
   */
  urlRoot?: string;
  /** Enable CORS via the "Access-Control-Allow-Origin" header.
   *
   * @default {false}
   */
  enableCors?: boolean;
  /** Do not print request level logs. Defaults to false.
   *
   * @default {false}
   */
  quiet?: boolean;
  /** The algorithm to use for generating the ETag.
   *
   * @default {"SHA-256"}
   */
  etagAlgorithm?: AlgorithmIdentifier;
  /** Headers to add to each response
   *
   * @default {[]}
   */
  headers?: string[];
}

/**
 * Serves the files under the given directory root (opts.fsRoot).
 *
 * ```ts
 * import { serve } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 * import { serveDir } from "https://raw.githubusercontent.com/zestack/zestack/main/server.ts";
 *
 * serve((req) => {
 *   const pathname = new URL(req.url).pathname;
 *   if (pathname.startsWith("/static")) {
 *     return serveDir(req, {
 *       fsRoot: "path/to/static/files/dir",
 *     });
 *   }
 *   // Do dynamic responses
 *   return new Response();
 * });
 * ```
 *
 * Optionally, you can pass `urlRoot` option. If it's specified that part is stripped from the beginning of the requested pathname.
 *
 * ```ts
 * import { serveDir } from "https://raw.githubusercontent.com/zestack/zestack/main/server.ts";
 *
 * // ...
 * serveDir(new Request("http://localhost/static/path/to/file"), {
 *   fsRoot: "public",
 *   urlRoot: "static",
 * });
 * ```
 *
 * The above example serves `./public/path/to/file` for the request to `/static/path/to/file`.
 *
 * @param req The request to handle
 * @param opts The serve directory options.
 */
export async function serveDir(req: Request, opts: ServeDirOptions = {}) {
  let response: Response;
  try {
    response = await createServeDirResponse(req, opts);
  } catch (error) {
    if (!opts.quiet) {
      logError(error);
    }
    response = serveFallback(req, error);
  }

  // Do not update the header if the response is a 301 redirect.
  const isRedirectResponse = isRedirectStatus(response.status);

  if (opts.enableCors && !isRedirectResponse) {
    response.headers.append("access-control-allow-origin", "*");
    response.headers.append(
      "access-control-allow-headers",
      "Origin, X-Requested-With, Content-Type, Accept, Range",
    );
  }

  if (!opts.quiet) {
    serverLog(req, response.status);
  }

  if (opts.headers && !isRedirectResponse) {
    for (const header of opts.headers) {
      const headerSplit = header.split(":");
      const name = headerSplit[0];
      const value = headerSplit.slice(1).join(":");
      response.headers.append(name, value);
    }
  }

  return response;
}

async function createServeDirResponse(
  req: Request,
  opts: ServeDirOptions,
) {
  const target = opts.fsRoot || ".";
  const urlRoot = opts.urlRoot;
  const { etagAlgorithm } = opts;

  const url = new URL(req.url);
  const decodedUrl = decodeURIComponent(url.pathname);
  let normalizedPath = posix.normalize(decodedUrl);

  if (urlRoot && !normalizedPath.startsWith("/" + urlRoot)) {
    return serveNotFound(req);
  }

  // Redirect paths like `/foo////bar` and `/foo/bar/////` to normalized paths.
  if (normalizedPath !== decodedUrl) {
    url.pathname = normalizedPath;
    return Response.redirect(url, 301);
  }

  if (urlRoot) {
    normalizedPath = normalizedPath.replace(urlRoot, "");
  }

  // Remove trailing slashes to avoid ENOENT errors
  // when accessing a path to a file with a trailing slash.
  if (normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  const fsPath = posix.join(target, normalizedPath);
  const fileInfo = await Deno.stat(fsPath);

  // For files, remove the trailing slash from the path.
  if (fileInfo.isFile && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return Response.redirect(url, 301);
  }
  // For directories, the path must have a trailing slash.
  if (fileInfo.isDirectory && !url.pathname.endsWith("/")) {
    // On directory listing pages,
    // if the current URL's pathname doesn't end with a slash, any
    // relative URLs in the index file will resolve against the parent
    // directory, rather than the current directory. To prevent that, we
    // return a 301 redirect to the URL with a slash.
    url.pathname += "/";
    return Response.redirect(url, 301);
  }

  // if target is file, serve file.
  if (!fileInfo.isDirectory) {
    return serveFile(req, fsPath, {
      etagAlgorithm,
      fileInfo,
    });
  }

  // if target is directory, serve index.html.
  const indexPath = posix.join(fsPath, "index.html");

  let indexFileInfo: Deno.FileInfo | undefined;
  try {
    indexFileInfo = await Deno.lstat(indexPath);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    // skip Not Found error
  }
  if (indexFileInfo?.isFile) {
    return serveFile(req, indexPath, {
      etagAlgorithm,
      fileInfo: indexFileInfo,
    });
  }
  return serveNotFound(req);
}

function logError(error: unknown) {
  console.error(red(error instanceof Error ? error.message : `${error}`));
}

function main() {
  const serverArgs = parse(Deno.args, {
    string: ["port", "host", "cert", "key", "header"],
    boolean: ["help", "cors", "verbose", "version"],
    negatable: ["cors"],
    collect: ["header"],
    default: {
      cors: true,
      verbose: false,
      version: false,
      host: "0.0.0.0",
      port: "4507",
      cert: "",
      key: "",
    },
    alias: {
      p: "port",
      c: "cert",
      k: "key",
      h: "help",
      v: "verbose",
      V: "version",
      H: "header",
    },
  });
  const port = Number(serverArgs.port);
  const headers = serverArgs.header || [];
  const host = serverArgs.host;
  const certFile = serverArgs.cert;
  const keyFile = serverArgs.key;

  if (serverArgs.help) {
    printUsage();
    Deno.exit();
  }

  if (serverArgs.version) {
    console.log(`Deno File Server ${VERSION}`);
    Deno.exit();
  }

  if (keyFile || certFile) {
    if (keyFile === "" || certFile === "") {
      console.log("--key and --cert are required for TLS");
      printUsage();
      Deno.exit(1);
    }
  }

  const wild = serverArgs._ as string[];
  const target = posix.resolve(wild[0] ?? "");

  const handler = (req: Request): Promise<Response> => {
    return serveDir(req, {
      fsRoot: target,
      enableCors: serverArgs.cors,
      quiet: !serverArgs.verbose,
      headers,
    });
  };

  const useTls = !!(keyFile && certFile);

  if (useTls) {
    serveTls(handler, {
      port,
      hostname: host,
      certFile,
      keyFile,
    });
  } else {
    serve(handler, { port, hostname: host });
  }
}

function printUsage() {
  console.log(`Deno File Server ${VERSION}
  Serves a local directory in HTTP.

INSTALL:
  deno install --allow-net --allow-read https://raw.githubusercontent.com/zestack/zestack/main/server.ts

USAGE:
  file_server [path] [options]

OPTIONS:
  -h, --help            Prints help information
  -p, --port <PORT>     Set port
  --cors                Enable CORS via the "Access-Control-Allow-Origin" header
  --host     <HOST>     Hostname (default is 0.0.0.0)
  -c, --cert <FILE>     TLS certificate file (enables TLS)
  -k, --key  <FILE>     TLS key file (enables TLS)
  -H, --header <HEADER> Sets a header on every request.
                        (e.g. --header "Cache-Control: no-cache")
                        This option can be specified multiple times.
  --no-cors             Disable cross-origin resource sharing
  -v, --verbose         Print request level logs
  -V, --version         Print version information

  All TLS options are required when one is provided.`);
}

if (import.meta.main) {
  main();
}
