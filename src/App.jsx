import React, { Component } from 'react';
import './App.css';
import ShipView from './components/ShipView/ShipView';
import TitleBar from './components/TitleBar/TitleBar';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: {
        startDate: null,
        endDate: null,
        minWeight: null,
        maxWeight: null,
      },
    };
  }

  filterShips(startDate, endDate, minWeight, maxWeight) {
    const filter = {
      startDate,
      endDate,
      minWeight,
      maxWeight,
    };
    this.setState({
      filter,
    }, () => console.log(filter));
  }

  render() {
    const { filter } = this.state;

    return (
      <div className="App">
        <div>
          <TitleBar onFilter={
            (startDate, endDate, minWeight, maxWeight) => {
              this.filterShips(startDate, endDate, minWeight, maxWeight);
            }
           }
          />
          {console.log(filter)}
          <ShipView
            filter={filter}
          />
        </div>
      </div>
    );
  }
}

export default App;
