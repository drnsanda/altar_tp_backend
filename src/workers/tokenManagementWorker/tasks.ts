import {parentPort} from 'worker_threads';
import fs from 'fs';
import path from 'path';
import { getTokenFile } from '../../utils';

const deleteFile = (filename: string) => {
    const fullPath = path.resolve(__dirname,'../../tokens/',filename);   
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Error deleting token ${filename}:`, err);
        return;
      }
      parentPort?.postMessage(`${filename} has expired removing from list.`)
    });
};

const getAllFilesInDirectory = (dirPath: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          reject(`Error reading directory: ${err}`);
        } else {
          // Filter out directories and return only file names
          const fileNames = files.filter(file => fs.lstatSync(path.join(dirPath, file)).isFile());
          resolve(fileNames);
        }
      });
    });
  };


  const handleTask = async ()=>{

    try{

    const files = await getAllFilesInDirectory(path.join(__dirname,"../../tokens"));


    for(let index=0;index<files.length;index++){
        const token = await getTokenFile(files[index]);
        if(token?.expiresAt < new Date().getTime()){
            deleteFile(files[index]);
        }   
    }
        
    }catch(error){
        console.error("Failed to complete task ",error);
    }     

  }
   
  parentPort?.on('message',(task)=>{    
    if(task==='execute'){      
        handleTask();
    }
  });           