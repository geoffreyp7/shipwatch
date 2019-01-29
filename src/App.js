import React, { Component } from "react";
import "./App.css";
import $ from "jquery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock, faArrowRight, faWeightHanging, faShip } from "@fortawesome/free-solid-svg-icons";

class App extends Component {

  render() {
    return (
      <div className="App">
        <div>
          <ShipView />
        </div>
      </div>
    );
  }
}

export default App;

class ShipView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ships: []
    };
    this.getShipData();
  }

  getShipData() {
    $.get(
      "https://api.allorigins.ml/get?url=" +
        encodeURIComponent(
          "https://nccports.portauthoritynsw.com.au/eports/Guest_Schedule_Main.asp?"
        ),
      response => {
        let responseContents = response.contents;
        let dom_nodes = $($.parseHTML(responseContents));
        let tableHTML = dom_nodes.find("tbody").prop("outerHTML");
        this.setShips(tableHTML);
      }
    );
  }

  setShips(data) {
    let shipsFromData = [];

    let dom_nodes = $($.parseHTML(data));
    dom_nodes.find("tr").each((index, element) => {
      let fields = $(element).find("td");
      if (fields.length !== 0) {
        let ship = {
          name: "",
          IMO: "",
          status: "",
          date: "",
          time: "",
          from: "",
          to: "",
          GRT: "",
          url: ""
        };

        let valuesArray = [];
        for (let i = 0; i < fields.length; i++) {
          let fieldValue = fields[
            i
          ].childNodes[1].childNodes[1].innerText.trim();
          if (i !== 0 && i !== 7 && i !== 8 && i <= 9) {
            valuesArray.push(fieldValue);
          }
        }

        // ship = Object.assign(ship, valuesArray);

        for (let i = 0; i < valuesArray.length; i++) {
          let fieldValue = valuesArray[i];
          switch (i) {
            case 0:
              ship.name = fieldValue;
              break;
            case 1:
              ship.IMO = fieldValue;
              break;
            case 2:
              ship.status = fieldValue;
              break;
            case 3:
              ship.date = fieldValue.split(" ")[0];
              ship.time = fieldValue.split(" ")[1];
              break;
            case 4:
              ship.from = fieldValue;
              break;
            case 5:
              ship.to = fieldValue;
              break;
            case 6:
              ship.GRT = Number.parseInt(fieldValue);
              break;
            default:
          }
        }

        ship.url = 'https://s3-ap-southeast-2.amazonaws.com/shipwatch/' + ship.IMO + '.jpg';

        shipsFromData.push(ship);
      }
    });

    console.log(shipsFromData);
    this.setState({
      ships: shipsFromData
    });
  }

  getShipCards() {
    let shipCards = [];
    let prevDate = "";
    for (let ship of this.state.ships) {
      if (ship.date !== prevDate) {
        shipCards.push(<DateCard date={ship.date}></DateCard>);
        prevDate = ship.date;
      }
      shipCards.push(<ShipCard ship={ship} />);
    }
    return shipCards;
  }

  render() {
    return <div className="card-view">{this.getShipCards()}</div>;
  }
}

class ShipCard extends Component {

  render() {
    return (
      <div className="card ship-card">
        <div className="ship-card__content">
          <h4 className="ship-card__heading">{this.props.ship.name}</h4>
          <hr className="ship-card__hr" />
          <p className="ship-card__text ship-card__text--left">
            <FontAwesomeIcon icon={faCalendarAlt} /> {this.props.ship.date}
          </p>
          <p className="ship-card__text ship-card__text--right">
            <FontAwesomeIcon icon={faClock} /> {this.props.ship.time}
          </p>
          <img className="ship-card__img" src={this.props.ship.url} alt="picture of ship"
            onError={(e)=>{e.target.onerror = null; e.target.src="404.png"}}/>
          <p className="ship-card__text">
            {this.props.ship.from} <FontAwesomeIcon icon={faArrowRight}/> {this.props.ship.to}
            </p>
          <p className="ship-card__text ship-card__text--left">
            <FontAwesomeIcon icon={faShip}/> {this.props.ship.status}</p>
          <p className="ship-card__text ship-card__text--right">
            <FontAwesomeIcon icon={faWeightHanging}/> {this.props.ship.GRT.toLocaleString()} Tons</p>
        </div>
      </div>
    );
  }
}

class DateCard extends Component {
    
  render() {
    return (
      <div className="card date-card">
        <div className="date-card__content">
          <div>
            <h4 className="date-card__calendar"><FontAwesomeIcon icon={faCalendarAlt}/></h4>
            <h4 className="date-card__heading">{this.props.date}</h4>
          </div>
        </div>
      </div>
    );
  }
}
