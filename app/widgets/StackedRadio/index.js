import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, StyleSheet } from 'react-native';
import { ListItem, Text, Icon } from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../../themes/colors';
import { getURL } from '../../services/helper';
import { TooltipBox } from '../TooltipBox';

const styles = StyleSheet.create({
  itemText: {
    fontSize: 12,
  },
  optionText: {
    fontSize: 11
  },
  tooltip: {
    textDecorationLine: 'underline',
    color: '#2082B0'
  }
});

export const StackedRadio = ({ value, config, onChange, token, onSelected, handleReplaceBehaviourResponse }) => {
  const optionNumber = config.options.length;
  const optionWidth = `${Math.floor(75 / optionNumber)}%`;
  const tokenValues = [];
  const multipleChoice = config.multipleChoice;

  let currentValue = value;

  if (!value) {
    currentValue = [];
    for (let i = 0; i < config.itemList.length; i++) {
      if (multipleChoice) {
        currentValue.push([]);
      } else {
        currentValue.push(null);
      }
    }
  }

  if (token) {
    for (let i = 0; i < config.itemList.length; i++) {
      tokenValues.push([]);
      for (let j = 0; j < config.options.length; j++) {
        tokenValues[i].push(config.itemOptions[i * config.options.length + j].value || 0);
      }
    }
  }

  const handlePress = (itemValue, i) => {
    if (multipleChoice) {
      const index = currentValue[i].indexOf(itemValue);
      if (index < 0) {
        currentValue[i].push(itemValue);
      } else {
        currentValue[i].splice(index, 1);
      }

      onChange(currentValue);
    } else {
      currentValue[i] = itemValue;
      onChange(currentValue);
    }

    onSelected();
  };

  console.log(value);
  console.log(config);

  return (
    <View style={{ alignItems: 'stretch' }}>
      <ListItem
        style={{ width: '100%' }}
      >
        <View style={{ width: '22%' }}></View>
        {
          config.options.map(option => (
            <View style={{ width: optionWidth }}>
              {option.description ? (
                <TooltipBox text={handleReplaceBehaviourResponse(option.description)}>
                  <Text
                    style={[styles.optionText, styles.tooltip]}
                    allowFontScaling={false}
                  >{ option.name.en }</Text>
                </TooltipBox>
              ) : (
                <Text
                  style={styles.optionText}
                  allowFontScaling={false}
                >{ option.name.en }</Text>
              )}
              {option.image ? (
                <Image
                  style={{ height: 32, resizeMode: 'contain' }}
                  source={{ uri: getURL(option.image) }}
                />
              ) : (
                <View />
              )}
            </View>
          ))
        }
      </ListItem>

      {config.itemList.map((item, i) => (
        <ListItem
          style={{ width: '100%' }}
          key={i}
        >
          <View style={{ width: '22%' }}>
            {item.description ? (
              <TooltipBox text={handleReplaceBehaviourResponse(item.description)}>
                <Text
                  style={[styles.itemText, styles.tooltip]}
                  allowFontScaling={false}
                >{item.name ? item.name.en : '' }</Text>
              </TooltipBox>
            ) : (
              <Text
                style={styles.itemText}
                allowFontScaling={false}
              >{item.name ? item.name.en : '' }</Text>
            )}
            {item.image ? (
                <Image
                  style={{ height: 32, resizeMode: 'contain' }}
                  source={{ uri: getURL(item.image) }}
                />
              ) : (
                <View />
              )}
          </View>

          {
            config.options.map((option, j) => (
              <View
                style={{
                  width: optionWidth,
                  flex: 1,
                  alignItems: "center"
                }}
              >
                {
                  multipleChoice && (
                    <CheckBox
                      checked={
                        currentValue[i].includes(`${option.name.en}${token ? ':'+tokenValues[i][j] : ''}`)
                      }
                      onPress={() => handlePress(`${option.name.en}${token ? ':'+tokenValues[i][j] : ''}`, i)}
                      checkedIcon="check-square"
                      uncheckedIcon="square-o"
                      checkedColor={colors.primary}
                      uncheckedColor={colors.primary}
                    />
                  ) || (
                    <CheckBox
                      checked={currentValue[i] === `${option.name.en}${token ? ':'+tokenValues[i][j] : ''}`}
                      onPress={() => handlePress(`${option.name.en}${token ? ':'+tokenValues[i][j] : ''}`, i)}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      checkedColor={colors.primary}
                    />
                  )
                }
              </View>
            ))
          }
        </ListItem>
      ))}
    </View>
  );
};

StackedRadio.defaultProps = {
  value: undefined,
};

StackedRadio.propTypes = {
  value: PropTypes.any,
  config: PropTypes.shape({
    itemList: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.string,
      }),
    ).isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.string,
      })
    ),
    itemOptions: PropTypes.array
  }).isRequired,
  token: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSelected: PropTypes.func.isRequired,
};
