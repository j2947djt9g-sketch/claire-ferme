import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";

// A separate origin lets the Safari test interrupt the network without touching
// the shared test server or Playwright's unsupported WebKit offline emulation.
export async function outageOrigin(){
 const root=process.cwd();
 const types={".html":"text/html",".mjs":"text/javascript",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json"};
 const server=createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
   const file=resolve(root,"."+(pathname.endsWith("/")?pathname+"index.html":pathname));
   if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
   const bytes=await readFile(file);
   res.writeHead(200,{"Content-Type":types[extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
   res.end(bytes);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const url="http://127.0.0.1:"+server.address().port+"/";
 let stopped=false;
 return {url,async stop(){
  if(stopped)return;stopped=true;
  await new Promise((resolve,reject)=>{server.close(err=>err?reject(err):resolve());server.closeAllConnections();});
 }};
}
