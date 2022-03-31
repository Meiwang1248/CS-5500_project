import React, {useState} from "react";

const HomePage = () => {
    const [inputValue, setInputValue] = useState('');
    const [list, setList] = useState([]);
    const [feature, setFeature] = useState(0);
    // const addItemToList = () => {
    //     setInputValue('');
    //     setList([...list, inputValue])
    // }
    const CalculateNumber = () =>(
        (async () => {
            var classifier = new EdgeImpulseClassifier();
            await classifier.init();
            var jsonOb = classifier.classify(inputValue);
            let values = [];
            let numbers = [];
            var idx = 0;
            while(idx <= 11){
                values.push(jsonOb.results[idx].value);
                numbers.push(jsonOb.results[idx].label);
                idx++;
            }
            console.log('results', values);

        })()
    );

    return (
        //分三个部分, 1、当前feature输入框，2、数字显示， 3、概率显示
        <div>
            <input
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
            />
            <button
                onClick={
                    () => {
                        CalculateNumber;
                        setList(
                            [...list, inputValue]);

                    }
                }
            >Submit Inline function</button>
            <ul>
                {

                    list.map((item, index) => {

                            return (
                                <>
                                    <ToDoItem2
                                        item={item}
                                        index={index}
                                    />

                                </>

                            )
                        }
                    )
                }
            </ul>
        </div>
    )
}

export default HomePage;