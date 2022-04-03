const getValueInput = () => {
    let inputValue = document.getElementById("input_field").value;
    let intArr = JSON.parse("[" + inputValue + "]");
    (async () => {
        var classifier = new EdgeImpulseClassifier();
        await classifier.init();
        let obj = classifier.classify(intArr);
        let labels = [];
        let values = [];
        for(let i = 0; i < 12; i++){
            labels[i] = obj.results[i].label;
            values[i] = obj.results[i].value;
        }
        let max = -1;
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
