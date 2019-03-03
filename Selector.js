import React, {Component} from 'react';
import ScrollPicker from 'react-native-wheel-scroll-picker';
 
export default class Selector extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
             <ScrollPicker
                  dataSource={this.props.options}
                  selectedIndex={this.props.selected}
                  renderItem={(data, index, isSelected) => {
                      //
                  }}
                  onValueChange={(data, selectedIndex) => {
                      //
                  }}
                  wrapperHeight={180}
                  wrapperWidth={150}
                  wrapperBackground={'#FFFFFF'}
                  itemHeight={60}
                  highlightColor={'#d8d8d8'}
                  highlightBorderWidth={2}
                  activeItemColor={'#222121'}
                  itemColor={'#B4B4B4'}
                />
        )
    }
}
