//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const xlsx = require('node-xlsx')

const fileReader = async () => {
    //joining path of directory 
    const directoryPath = path.join(__dirname, 'PizzaImages');
    //passsing directoryPath and callback function
    // console.log("path : ",directoryPath)
    let allFiles= fs.readdirSync(directoryPath,  async(err, files) => {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        let filesList =[]
        for(let i=0 ;i<files.length ;i++){
            if(files[i]){  
                filesList.push(files[i])
                // console.log("path : ",directoryPath)
            }
        }
        return filesList;
    });
    // console.log("allFiles: ",allFiles)

    while(allFiles){
        allFiles.push(directoryPath)
        return allFiles;
    }
    
    
}

const imgsPayload = async ()=>{
    let payload= []
    let imagePayload = {name: '',RAW : '', BAKED : ''}
    const listOfFiles = await fileReader()
    // console.log("listOfFiles: ",listOfFiles)
    for(let i=0 ; i<listOfFiles.length-1 ;i++){
        //split on '-'
        const eachItem = listOfFiles[i].split(' -')
        const BAKED = eachItem.includes(' BAKED.png')
        const RAW = eachItem.includes(' RAW.png')
        const pItem = payload.filter(data=>data.name===eachItem[0])
        if( pItem.length !==0 ){
            // console.log(" pItem.length !==0 : ",pItem)
            if(BAKED){
                // console.log("name exist BAKED is caught  : ",BAKED )
                pItem[0].BAKED = `src/Data/PizzaImages/${listOfFiles[i]}`
                    
            }
            else if(RAW){
                // console.log(" name exist Raw is caught : ",RAW) 
                pItem[0].RAW =`src/Data/PizzaImages/${listOfFiles[i]}`
            }

        }
        else{
            // console.log("EMpty -> : ",pItem)
            if(BAKED){
                imagePayload.name = eachItem[0]
                imagePayload.BAKED = `src/Data/PizzaImages/${listOfFiles[i]}`
                payload.push(imagePayload)  
            } 
            else if(RAW){
                imagePayload.name = eachItem[0]
                imagePayload.RAW =`src/Data/PizzaImages/${listOfFiles[i]}`
                payload.push(imagePayload) 
            }  
            
            imagePayload = {name: '',RAW : '', BAKED : ''} 
        }
        // console.log("ith payload: ",payload)

        //end loop
    }
    // console.log("payload: ",payload)
    return payload

}

exports.myData =async ()=>{
    const ImgData = await imgsPayload()
    return ImgData
}

exports.readXslx = async()=>{

    //Parse Xlsx
    const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(`${__dirname}/TESTNET ONLY - Ingredients Information.xlsx`));
    // console.log("workSheetsFromBuffer: ",workSheetsFromBuffer[0].data)
    const BufferData = workSheetsFromBuffer[0].data
    const imagesData = await this.myData()
    // console.log("images: ",imagesData)
    // console.log("BufferData: ",BufferData)
    const xslxData =await BufferData.slice(1,BufferData.length)
    // console.log("xslxData : ",xslxData)
    for(let i=0 ;i<imagesData.length ; i++){
        const item = imagesData[i]
        const name = (imagesData[i].name).trim()
        // console.log("item : ",item)
        for(let j=0 ;j<xslxData.length ;j++){
            const real = xslxData[j][1]
            // console.log('real: ',real)
            if(real==='GlutenFree' && name=== "Gluten-free"){
                imagesData[i].layerNum = xslxData[j][0]
                imagesData[i].price = xslxData[j][2]
                imagesData[i].category = (xslxData[j][5])
                imagesData[i].artistAddress =xslxData[j][4]
                imagesData[i].type =xslxData[j][6]
            }
            if(name.trim() === real.trim()){
                // console.log("item: ",item)
                // console.log("real : ",real)
                
                imagesData[i].layerNum = xslxData[j][0]
                imagesData[i].price = xslxData[j][2]
                imagesData[i].category = (xslxData[j][5])
                imagesData[i].artistAddress =xslxData[j][4]
                imagesData[i].type =xslxData[j][6]
            }
        }
        // console.log("xlsxData: ",xslxData[j][1])

    }

    // console.log("imagesData: ",imagesData)
    return imagesData
    


}
// readXslx()