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
csv.fromPath("data2.csv")
 .on("data", function(data){
    let chance = randRange(0,100);
    if(chance < 70){
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
    let corrCount = 0, wrongCount = 0;
    attrDist=[];
    training[0].forEach((k,i)=>{
        attrDist[i]=[...new Set(training.map(item => item[i]))];
    })
    classAttrDist={};
    Object.keys(classDist).forEach((key)=>{
        classAttrDist[key]=[];
    });
    Object.keys(classDist).forEach((k)=>{
        attrDist.forEach((a,j)=>{
            classAttrDist[k][j]={};
            a.forEach((l)=>{
                classAttrDist[k][j][l]=countAttr(training,j,l,k);
            })
        })
    })
    console.log(classAttrDist);
    testing.forEach((d,i)=>{
        let probability={};
        classNames=Array.from(classNames);
        classNames.forEach((classn)=>{
            probability[classn]=1;
        });
        d.forEach((cell, i)=>{
            classNames.forEach((classn)=>{
                if(i !== d.length - 1 ){
                    probability[classn] *= classAttrDist[classn][i][cell]
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
        if(className === d[d.length-1]){
            corrCount+=1;
        }else{
            wrongCount+=1;
        }
        // console.log('\033[2J');

        // console.log("Progress: ", (((i+1)/testing.length) * 100).toFixed(2), "%");

    })
    console.log("Accuracy: ", (100*corrCount/testing.length).toFixed(2),"%");
 });