let labels = [];//每个数字
let values = [];//每个数字的概率
let max = -1; //max就是当前模型识别出来的数字
const getValueInput = () => {
    let inputValue = document.getElementById("input_field").value;
    let intArr = JSON.parse("[" + inputValue + "]");
    (async () => {
        var classifier = new EdgeImpulseClassifier();
        await classifier.init();
        let obj = classifier.classify(intArr);
        console.log(obj);
        for(let i = 0; i < 12; i++){
            labels[i] = obj.results[i].label;
            values[i] = obj.results[i].value;
        }
        // let max = -1;
        let idx = -1;
        for(let i = 0; i < 12; i++){
            if(values[i] > max){
                max = values[i];
                idx = i;
            }
        }
        document.getElementById("h_one").innerHTML = labels[idx];
    })();
}
const add_feature_button = $("#add_features_button");
add_feature_button.click(getValueInput);

let data = [];
for(let i = 0; i < 12; i++){
    switch (labels[i]){
        case "zero" :
            data[0] = values[i];
            break;
        case "one" :
            data[0] = values[i];
            break;
        case "two" :
            data[0] = values[i];
            break;
        case "three" :
            data[0] = values[i];
            break;
        case "four" :
            data[0] = values[i];
            break;
        case "five" :
            data[0] = values[i];
            break;
        case "six" :
            data[0] = values[i];
            break;
        case "seven" :
            data[0] = values[i];
            break;
        case "eight" :
            data[0] = values[i];
            break;
        case "nine" :
            data[0] = values[i];
            break;
        case "ten" :
            data[0] = values[i];
            break;
        case "undefined" :
            data[0] = values[i];
            break;


    }
}