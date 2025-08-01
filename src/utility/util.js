import {
   FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFileCode,
  FaFileVideo,
  FaFileArchive,
  FaFile,
} from "react-icons/fa";
export const runhtml= async(url,doc)=>{
     if(!url)return {success:false,message:"url missing"}
      try {
      fetch(url)
        .then(res => res.text())
        .then(html => {
         const titleTag = `<title>${doc.name}</title>`;
          const hasTitle = /<title>.*<\/title>/i.test(html);
          
          let modifiedHtml;
          if (hasTitle) {
            modifiedHtml = html.replace(/<title>.*<\/title>/i, titleTag);
          } else if (/<head>/i.test(html)) {
            modifiedHtml = html.replace(/<head>/i, `<head>\n  ${titleTag}`);
          } else {
            modifiedHtml = `<!DOCTYPE html><html><head>${titleTag}</head><body>${html}</body></html>`;
          }
          const blob = new Blob([modifiedHtml], { type: "text/html" });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          return {success:true,message:"html running ..."};
        });
    } catch (err) {
      console.error("Error rendering HTML:", err);
      return {success:false,message:err.message}
    }
}

 export const getFileIcon = (fileName, fileType) => {
  const ext = fileName?.split(".").pop().toLowerCase();

  if (fileType.includes("pdf") || ext === "pdf") return <FaFilePdf color="red" />;
  if (fileType.includes("image") || ["jpg", "jpeg", "png", "gif"].includes(ext))
    return <FaFileImage color="green" />;
  if (["doc", "docx"].includes(ext)) return <FaFileWord color="blue" />;
  if (["xls", "xlsx"].includes(ext)) return <FaFileExcel color="green" />;
  if (["zip", "rar"].includes(ext)) return <FaFileArchive color="orange" />;
  if (["mp4", "mkv", "avi"].includes(ext)) return <FaFileVideo color="purple" />;
  if (["js", "html", "css", "java", "cpp", "py"].includes(ext))
    return <FaFileCode color="teal" />;
  if (["txt", "md"].includes(ext)) return <FaFileAlt color="gray" />;

  return <FaFile color="black" />;
};


export const checkfile = async(files ,data)=>{
     if(files.length <=0){
      return true;
     }
     return !files.some((f) => f.name === data.file.name);
}