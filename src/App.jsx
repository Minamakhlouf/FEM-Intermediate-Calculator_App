import './App.css'; 
import {useState, useEffect, useRef} from "react"; 
import Button from "./components/Button"; 
import BigNumber from "bignumber.js"; 

function App() {
  const [sliderValue, setSliderValue] = useState("0"); 
  const [inputInfo, setInputInfo] = useState({
    stage: 0, 
    inputOne: "0", 
    inputTwo: "", 
    operator: null, 
    lastInput: "", 
    isDesktop: window.innerWidth >= 540 ? true : false 
  }); 
  
  const containerRef = useRef(); 
  const textRef = useRef(); 

  let textFontSize = inputInfo.isDesktop ? 56 : 40; 

  useEffect(() => {
    const handleWindowSizeChange = () => {
      if (inputInfo.isDesktop === true && window.innerWidth < 540) {
        setInputInfo((prev) => {
          return {...prev, isDesktop: false}
        })
      } else if (inputInfo.isDesktop === false && window.innerWidth > 540) {
        setInputInfo((prev) => {
          return {...prev, isDesktop: true}
        })
      }
    }

    window.addEventListener("resize", handleWindowSizeChange); 

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange); 
    }
  }, [inputInfo])

  useEffect(() => {
    const handleKeyDown = (event) => {
      handleKeyPress(event)
    }

    window.addEventListener("keydown", handleKeyDown); 

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    };
  }, [inputInfo]); 

  useEffect(() => {
    console.log("useEffect Running...")
    if (!textRef || !containerRef) return; 

    const adjustFontSize = () => {
      const text = textRef.current; 
      const container = containerRef.current; 
      let desiredFontSize = inputInfo.isDesktop ? 56 : 40; 
      const computedTextStyle = window.getComputedStyle(text); 
      const computedFontSize = computedTextStyle.fontSize; 
      let newFontSize = parseFloat(computedFontSize); 
      console.log(inputInfo.isDesktop)

      if (text.clientWidth / container.clientWidth >= 0.85) {
        while (text.clientWidth / container.clientWidth >= 0.85) {
          newFontSize -= 1; 
          textFontSize = newFontSize;
          textRef.current.style.fontSize = `${newFontSize}px`; 
          console.log(newFontSize)
        }
      } else if (newFontSize < desiredFontSize && text.clientWidth / container.clientWidth <= 0.80) {
        while (newFontSize < desiredFontSize && text.clientWidth / container.clientWidth <= 0.80) {
          newFontSize += 1; 
          textFontSize = newFontSize; 
          textRef.current.style.fontSize = `${newFontSize}px`; 
          console.log(newFontSize)
        }
      }
    }

    const resizeObserver = new ResizeObserver(adjustFontSize); 
    resizeObserver.observe(textRef.current); 
    resizeObserver.observe(containerRef.current); 

    return () => {
      resizeObserver.disconnect(); 
    }

  }, [inputInfo]); 
  
  let inputValue = inputInfo.stage === 2 ? inputInfo.inputTwo : inputInfo.inputOne;  

  let sliderPosition = {justifyContent: "flex-start"}; 
  let theme = "theme-1"; 

  if (sliderValue === "1") {
    sliderPosition.justifyContent = "center"; 
    theme = "theme-2"; 
  } else if (sliderValue === "2") {
    sliderPosition.justifyContent = "flex-end"; 
    theme = "theme-3"; 
  }

  const themeChangeHandler = (e) => {
    setSliderValue(e.target.value); 
  }

  const operandInputHandler = (value) => {
    let hasError = false; 

    if (inputValue === "0" && value === "0") {
      hasError = true; 
    } else if (inputValue.includes(".") && value === ".") {
      hasError = true; 
    } else if (inputInfo.stage === 0 && inputInfo.inputOne.length > 15) {
      hasError = true; 
    } else if (inputInfo.stage === 2 && inputInfo.inputTwo.length > 15) {
      hasError = true; 
    }

    if (!hasError && inputInfo.stage === 0) {
      if (inputValue.length === 1 && inputValue === "0" && value !== ".") {
        setInputInfo((prevState) => {
          return {...prevState, inputOne: value}
        }); 
      } else {
        setInputInfo((prevState) => {
          return {...prevState, inputOne: prevState.inputOne + value} 
        })
      }
    }

    if (!hasError && inputInfo.stage === 1) {
      if (inputInfo.inputTwo.length === 0 && value === ".") {
        setInputInfo((prevState) => {
          return {...prevState, inputTwo: `0${value}`, stage: 2}
        })
      } else {
        setInputInfo((prevState) => {
          return {...prevState, inputTwo: prevState.inputTwo + value, stage: 2}
        })
      }
    }

    if (!hasError && inputInfo.stage === 2) {
      if (inputInfo.inputTwo === "0" && value !== "0" && value !== ".") {
        setInputInfo((prevState) => {
          return {...prevState, inputTwo: value}
        })
      } else {
        setInputInfo((prevState) => {
          return {...prevState, inputTwo: prevState.inputTwo + value}
        })
      }
    }
  }

  const makeCalculation = (hasLastInput = false) => {
      let firstNumber = new BigNumber(inputInfo.inputOne); 
      let secondNumber = hasLastInput ? new BigNumber(inputInfo.lastInput) : new BigNumber(inputInfo.inputTwo); 
      let result; 

      switch (inputInfo.operator) {
        case "+": 
          result = firstNumber.plus(secondNumber); 
          break; 
        case "-": 
          result = firstNumber.minus(secondNumber); 
          break; 
        case "x": 
          result = firstNumber.multipliedBy(secondNumber); 
          break; 
        default: 
          result = firstNumber.dividedBy(secondNumber); 
          break
      }

      return result.toString();
  }

  const operatorInputHandler = (value) => {
    if (inputInfo.stage === 0) {
      setInputInfo((prevState) => {
        return {...prevState, operator: value, stage: 1}
      })
    }
    
    if (inputInfo.stage === 1 && inputInfo.inputTwo === "") {
      setInputInfo((prevState) => {
        return {...prevState, operator: value}
      })
    }

    if (inputInfo.stage === 2) {
      setInputInfo((prevState) => {
        return {...prevState, stage: 1, inputOne: makeCalculation(), inputTwo: "", lastInput: prevState.inputTwo, operator: value}
      })
    }
  }

  const resetInputHandler = () => {
    setInputInfo((prevState) => {
      return {...prevState, stage: 0, inputOne: "0", inputTwo: "", operator: "", lastInput: ""}
    })
  }

  const removeLastInput = (input) => {
    // Use .split(), .join() and .pop() to remove last digit from the string. 
    let inputArray = input.split("")
    inputArray.pop();
    let newString = inputArray.join("");
    return newString.length > 0 ? newString : "0";   
  }

  const deleteInputHandler = () => {
    if (inputInfo.stage === 0) {
      let removeLastDigit = removeLastInput(inputInfo.inputOne)
      setInputInfo((prevState) => {
        return {...prevState, inputOne: removeLastDigit}
      })
    } else if (inputInfo.stage === 2) {
      let removeLastDigit = removeLastInput(inputInfo.inputTwo); 
      setInputInfo((prevState) => {
        return {...prevState, inputTwo: removeLastDigit}
      })
    }
  }

  const equalsInputHandler = () => {
    if (inputInfo.lastInput && inputInfo.stage === 1) {
      setInputInfo((prevState) => {
        return {...prevState, inputOne: makeCalculation(true)}
      }) 
    } else if (!inputInfo.lastInput && inputInfo.inputTwo) {
      setInputInfo((prevState) => {
        return {...prevState, stage: 1,  inputOne: makeCalculation(), inputTwo: "", lastInput: prevState.inputTwo}
      })
    } else if (inputInfo.stage === 2 && inputInfo.inputTwo !== inputInfo.lastInput) {
      setInputInfo((prevState) => {
        return {...prevState, stage: 1, inputOne: makeCalculation(), inputTwo: "", lastInput: prevState.inputTwo}
      })
    } else if (inputInfo.stage === 2 && inputInfo.inputTwo === inputInfo.lastInput) {
      setInputInfo((prevState) => {
        return {...prevState, stage: 1, inputOne: makeCalculation(), inputTwo: ""}
      })
    } else {
      return
    }
  }

  const limitInputDigits = (input) => {
    let splitInputByDecimal = input.split("."); 

    let numDigits = splitInputByDecimal[1] ? splitInputByDecimal[0].length + splitInputByDecimal[1].length : splitInputByDecimal[0].length;

    let roundDigits; 

    if (numDigits > 16 && splitInputByDecimal[0] !== "0") {
      roundDigits = Number(input).toPrecision(16).split("."); 
    } else if (numDigits > 16 && splitInputByDecimal[0] === "0") {
      roundDigits = Number(input).toExponential(14).split("."); 
    }

    return roundDigits ? roundDigits : splitInputByDecimal; 
  }

  const addCommasToInput = (input) => {
    let newCommaString = ""; 
    let splitInputByDecimal = limitInputDigits(input); 
    let integerArray = splitInputByDecimal[0].split(""); 
    let isNegative = integerArray[0] === "-" ? integerArray.shift() : null; 
    let modulo = integerArray.length % 3; 
    
    if (splitInputByDecimal[0].includes("e") || splitInputByDecimal[0] === "Infinity") {
      if (splitInputByDecimal[0].includes("e-20")) {
        alert("This calculator cannot compute a number smaller than e-20 in scientific notation. Further division will result in an output of 0"); 
      }
      return splitInputByDecimal[0]; 
    }
    
    while (integerArray.length > 0) {
      if (integerArray.length % 3 !== 0 && integerArray.length > 3) {
        let splice = integerArray.splice(0, modulo); 
        let joinSplice = splice.join("");
        newCommaString += joinSplice + ","; 
      } else if (integerArray.length % 3 === 0 && integerArray.length > 3) {
        let splice = integerArray.splice(0, 3); 
        let joinSplice = splice.join("");
        newCommaString += joinSplice + ","; 
      } else {
        let splice = integerArray.splice(0, 3); 
        let joinSplice = splice.join("");
        newCommaString += joinSplice; 
      }
    }

    if (isNegative) {
      newCommaString = "-" + newCommaString; 
    }

    if (splitInputByDecimal[1] !== undefined) {
      newCommaString += "." + splitInputByDecimal[1]; 
    }

    return newCommaString; 
  }

  let inputWithCommas = inputInfo.stage === 2 ? addCommasToInput(inputInfo.inputTwo) : addCommasToInput(inputInfo.inputOne); 


  const handleKeyPress = (event) => {
    /* Check for cases where there is a shiftkey */
    const { key, shiftKey} = event; 

    if (shiftKey) {
      switch (key) {
        case "*": 
          operatorInputHandler(key);
          break; 
        case "+": 
          operatorInputHandler(key);
          break; 
        case "C": 
          resetInputHandler(); 
          break; 
      }
    } else {
      switch (key) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "0":
        case ".": 
          operandInputHandler(key); 
          break; 
        case "Enter": 
          equalsInputHandler(); 
          break; 
        case "Backspace": 
          deleteInputHandler(); 
          break; 
        case "/": 
          operatorInputHandler(key);
          break; 
        case "-": 
          operatorInputHandler(key); 
          break; 
        case "c": 
          resetInputHandler(); 
          break; 
      }

    }
    console.log(key)
  }

  return (
    <main className={theme}>
      <section>
        <header>
          <h1 className='text__no-btn'>calc</h1>
          <div className='theme-grid'>
            <p className='slider_numbers text__no-btn'><span>1</span><span>2</span><span>3</span></p>
            <p className='slider_title text__no-btn'>THEME</p>
            <div className='slider_container btn-background' style={sliderPosition}>
              <div className='slider_ball btn-3'></div>
              <input onChange={themeChangeHandler} className='slider_range' type="range" min="0" max="2" step="1" value={sliderValue} />
            </div>
          </div>
        </header>
        <div ref={containerRef} className='result-panel text__no-btn screen' >
          <span ref={textRef} style={{fontSize: `${textFontSize}px`}}>{inputWithCommas}</span>
        </div>
        <div className='button-container btn-background'>
          <Button className='btn btn-1' value="7" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="8" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="9" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-2' value="DEL" onClickFunction={deleteInputHandler}/>
          <Button className='btn btn-1' value="4" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1'value="5" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="6" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="+" onClickFunction={operatorInputHandler}/>
          <Button className='btn btn-1' value="1" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="2" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="3" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="-" onClickFunction={operatorInputHandler}/>
          <Button className='btn btn-1' value="." onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="0" onClickFunction={operandInputHandler}/>
          <Button className='btn btn-1' value="/" onClickFunction={operatorInputHandler}/>
          <Button className='btn btn-1' value="x" onClickFunction={operatorInputHandler}/>
          <Button className='btn button-container_last-row btn-2' value="RESET" onClickFunction={resetInputHandler}/>
          <Button className='btn button-container_last-row btn-3' value="=" onClickFunction={equalsInputHandler}/>
        </div>
      </section>
    </main>
  )
}

export default App
