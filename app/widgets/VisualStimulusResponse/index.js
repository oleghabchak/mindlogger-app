import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Text, View, Platform, ActivityIndicator,StyleSheet, NativeModules, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { sendData } from "../../services/socket";
import CounterView from './CounterView';

const htmlSource = require('./visual-stimulus-response.html');

const HelloWorld = NativeModules.HelloWorldModule;

export const VisualStimulusResponse = ({ onChange, config, isCurrent, appletId }) => {
  const [tryIndex, setTryIndex] = useState(1);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0)
  const webView = useRef();

  // Prepare config data for injecting into the WebView
  // const trials = config.trials.map(trial => ({
  //   stimulus: {
  //     en: trial.image
  //   },
  //   choices: trial.valueConstraints.itemList,
  //   correctChoice: typeof trial.value === 'undefined' ? -1 : trial.value,
  //   weight: typeof trial.weight === 'undefined' ? 1 : trial.weight,
  // }));

  // const continueText = [
  //   `Press the button below to ${config.lastScreen ? 'finish' : 'continue'}.`
  // ];
  // const restartText = [
  //   'Remember to respond only to the central arrow.',
  //   'Press the button below to end current block and restart.'
  // ];

  // const configObj = {
  //   trials,
  //   showFixation: config.showFixation !== false,
  //   showFeedback: config.showFeedback !== false,
  //   showResults: config.showResults !== false,
  //   trialDuration: config.trialDuration || 1500,
  //   samplingMethod: config.samplingMethod,
  //   samplingSize: config.sampleSize,
  //   buttonLabel: config.nextButton || 'Finish',
  //   minimumAccuracy: tryIndex < config.maxRetryCount && config.minimumAccuracy || 0,
  //   continueText,
  //   restartText: tryIndex < config.maxRetryCount ? restartText : continueText
  // };
  // const screenCountPerTrial = configObj.showFeedback ? 3 : 2;

  // const injectConfig = `
  //   window.CONFIG = ${JSON.stringify(configObj)};
  //   start();
  // `;

  const source = Platform.select({
    ios: htmlSource,
    android: { uri: 'file:///android_asset/html/visual-stimulus-response.html' },
  });

  // useEffect(() => {
  //   if (isCurrent) {
  //     webView.current.injectJavaScript(injectConfig);
  //   }
  // }, [isCurrent])

  

  const parseResponse = (record) => ({
    trial_index: Math.ceil((record.trial_index + 1) / screenCountPerTrial),
    duration: record.rt,
    question: record.stimulus,
    button_pressed: record.button_pressed,
    start_time: record.image_time,
    correct: record.correct,
    start_timestamp: record.start_timestamp,
    offset: record.start_timestamp - record.start_time,
    tag: record.tag,
  })

const onPress = () => {
  
    if(Platform.OS == "android"){
      NativeModules.HelloWorldModule.ShowMessage("This is first time we are creating bridge. :)", 5);
    }
    else if(Platform.OS == "ios"){
      NativeModules.HelloWorld.ShowMessage("This is first time we are creating bridge. :)", 1);
    
  }
}
// onPress();

  return (
    <View
      style={{
        position: 'relative',
        backgroundColor: 'red',
        width: '70%',
        height: 40,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <TouchableOpacity onPress={onPress}> 
        <Text>Click Me!</Text>
      </TouchableOpacity>
      <TouchableOpacity
          style={[styles.wrapper, styles.border]}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.button}>
            {count}
          </Text>
        </TouchableOpacity>
      {/* <CounterView /> */}
      {/* <WebView
        ref={(ref) => webView.current = ref}
        style={{ flex: 1, height: '100%' }}
        onLoad={() => setLoading(false)}
        source={source}
        originWhitelist={['*']}
        scrollEnabled={false}
        onMessage={(e) => {
          const dataString = e.nativeEvent.data;
          const { type, data } = JSON.parse(dataString);

          if (type == 'response') {
            sendData('live_event', parseResponse(data), appletId);
            return ;
          }

          let correctCount = 0, totalCount = 0;
          for (let i = 0; i < data.length; i++) {
            if (data[i].tag == 'trial') {
              totalCount++;
              if (data[i].correct) {
                correctCount++;
              }
            }
          }

          if (
            config.minimumAccuracy &&
            correctCount * 100 / config.minimumAccuracy < totalCount && 
            tryIndex < config.maxRetryCount
          ) {
            setResponses(responses.concat(data.filter(trial => trial.tag != 'result' && trial.tag != 'prepare')));
            setTryIndex(tryIndex+1);
            webView.current.injectJavaScript(injectConfig);
          } else {
            setLoading(true);

            setTimeout(() => {
              onChange(responses.concat(data.filter(trial => trial.tag != 'result' && trial.tag != 'prepare')).map(record => parseResponse(record)), true);
            }, 0)
          }
        }}
      />  */}

      {
         
          // <View
          //   style={{
          //     backgroundColor: 'red',
          //     width: '100%',
          //     height: '100%',
          //     flex: 1,
          //     alignItems: 'center',
          //     justifyContent: 'center'
          //   }}
          // >
          
                  
          // </View>
        
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: "stretch"
  },
  wrapper: {
    flex: 1, alignItems: "center", justifyContent: "center"
  },
  border: {
    borderColor: "#eee", borderBottomWidth: 1
  },
  button: {
    fontSize: 50, color: "orange"
  }
});

VisualStimulusResponse.propTypes = {
  config: PropTypes.shape({
    trials: PropTypes.arrayOf(PropTypes.shape({
      image: PropTypes.string,
      valueConstraints: PropTypes.object,
      value: PropTypes.number,
      weight: PropTypes.number,
    })),
    showFixation: PropTypes.bool,
    showFeedback: PropTypes.bool,
    showResults: PropTypes.bool,
    trialDuration: PropTypes.number,
    samplingMethod: PropTypes.string,
    samplingSize: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
  appletId: PropTypes.string.isRequired,
};
