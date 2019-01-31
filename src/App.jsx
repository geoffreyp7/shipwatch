import React, { Component } from 'react';
import './App.css';
import ShipView from './components/ShipView';
import TitleBar from './components/TitleBar/TitleBar';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      temp: '',
    };
    let { temp } = this.state;
    temp = 4;
    if (temp === 4) {
      temp = 3;
    }
  }

  render() {
    return (
      <div className="App">
        <div>
          <TitleBar />
          <ShipView />
        </div>
      </div>
    );
  }
}

export default App;
