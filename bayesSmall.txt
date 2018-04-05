var csv = require("fast-csv");
let training = [], testing = [];
let classDist = {};
let classNames = new Set();
function randRange(min, max){
    return Math.random() * (max - min) + min;
}
function countAttr(data, attrName, attrValue, classValue){
    let count = 0;
    data.forEach((d)=>{
        if(d[attrName] === attrValue && d[d.length-1] === classValue){
            count+=1;
        }
    })
    return count;
}
let c = 0;
csv.fromPath("data3.csv")
 .on("data", function(data){
    let chance = randRange(0,100);
    c+=1;
    if(c < 15){
        training.push(data);
        classNames.add(data[data.length-1])
        if(classDist[data[data.length-1]]){
            classDist[data[data.length-1]]+=1;
        }else{
            classDist[data[data.length-1]]=1;
        }   
    }else{
        testing.push(data);
        classNames.add(data[data.length-1])
    }
 })
 .on("end", function(){
     console.log(training, testing);
    let corrCount = 0, wrongCount = 0;
    testing.forEach((d,i)=>{
        let probability={};
        classNames=Array.from(classNames);
        classNames.forEach((classn)=>{
            probability[classn]=1;
        });
        d.forEach((cell, i)=>{
            classNames.forEach((classn)=>{
                if(i !== d.length - 1 ){
                    probability[classn] *= countAttr(training, i, cell, classn);
                    probability[classn] /= classDist[classn];
                }
            })
        })
        classNames.forEach((classn)=>{
            probability[classn] *= classDist[classn];
            probability[classn] /= (training.length)
        })

        let psum = 0;
        Object.keys(probability).forEach((key)=>{
            psum += probability[key];
        });

        Object.keys(probability).forEach((key)=>{
            probability[key] = Number((probability[key]/psum).toFixed(2));
        });
        let max = 0, className;
        Object.keys(probability).forEach((key)=>{
            if(probability[key] > max){
                max = probability[key];
                className = key;
            }
        });
        console.log(className, probability);
        if(className === d[d.length-1]){
            corrCount+=1;
        }else{
            wrongCount+=1;
        }
        // console.log('\033[2J');

        console.log("Progress: ", (((i+1)/testing.length) * 100).toFixed(2), "%");

    })
    console.log("Accuracy: ", corrCount/testing.length);
 });