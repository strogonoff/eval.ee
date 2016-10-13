import React, { Component } from 'react';
import GridOfSquares from './sheepsweeper.jsx';
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: new GridOfSquares(14, 14),
      step: 0,
      score: {},
    };

    this.onItemDiscovery = this.onItemDiscovery.bind(this);
    this.onStep = this.onStep.bind(this);
    this.start = this.start.bind(this);
    this.updateSheepWalkComponent = this.updateSheepWalkComponent.bind(this);
  }

  render() {
    return (
      <div className="Game">
        <SheepWalk
          grid={this.state.grid}
          onStep={this.onStep}
          onItemDiscovery={this.onItemDiscovery}
          ref={(c) => this.updateSheepWalkComponent(c)} />
        <div className="Dashboard"
            style={{flexBasis: '15vh', display: 'flex', flexFlow: 'row nowrap'}}>
          <Score score={this.state.score} step={this.state.step} />
          <Controls onStart={this.start} canRestart={this.state.step !== 0} />
        </div>
      </div>
    )
  }

  start() {
    this.setState({
      grid: new GridOfSquares(14, 14),
      step: 0,
      score: {}
    });
  }

  onItemDiscovery(item) {
    let score = this.state.score;
    if (!score[item]) {
      score[item] = 1;
    } else {
      score[item] = score[item] + 1;
    }
    this.setState({score: score});
  }

  updateSheepWalkComponent(component) {
    if (this.initiallyExposedSquare && component) {
      component.onExposure(this.initiallyExposedSquare);
      this.initiallyExposedSquare = undefined;
    }
  }

  onStep(coords) {
    if (this.state.step === 0 && this.state.score['🐑']) {
      let newGrid;
      let squareType;
      let square;

      while (squareType !== '🌱') {
        newGrid = new GridOfSquares(14, 14);
        square = newGrid.getSquareAt(coords);
        squareType = square.type;
      };

      this.setState({grid: newGrid, step: 1, score: {}});
      this.initiallyExposedSquare = square;
      square.expose();

    } else {
      this.setState({step: this.state.step + 1});
    }
  }
}

class Controls extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  render() {
    return (
      <div className="Controls">
        <button disabled={!this.props.canRestart} onClick={this.onClick}>New pasture</button>
      </div>
    )
  }
  onClick() {
    this.props.onStart();
  }
}

class Score extends Component {
  render() {
    return (
      <div className="Score" style={{opacity: this.props.step > 0 ? '1' : '0'}}>
        <div style={{display: Object.keys(this.props.score).length > 0 ? 'block' : 'none'}}>
          <div>Inventory:</div>
          {Object.keys(this.props.score).map(key => (
            <span key={key} className="ScoreItem">
              <span>{key}</span>
              &ensp;
              <strong>{this.props.score[key]}</strong>
              &emsp;
            </span>
          ))}
        </div>
        <div style={{display: this.props.step >= 1 ? 'block' : 'none'}}>
          <span>
            <span>Step</span>
            &ensp;
            <strong>{this.props.step}</strong>
          </span>
          &emsp;
          <span><strong>{this.props.score['🌱']}</strong> squares of pasture have been uncovered. </span>
        </div>
        <div style={{display: this.props.score['🐑'] >= 1 ? 'block' : 'none'}}>
          <span>You have found the sheep.</span>
          <br />
          <span>The sheep are alarmed.</span>
        </div>
      </div>
    );
  }
}

class SheepWalk extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exposedSquares: new Set(),
    }

    this.onExposure = this.onExposure.bind(this);
  }

  render() {
    return (
      <div className="Grid">
        {this.props.grid.squares.map(square => (
          <Square
            key={square.key}
            square={square}
            grid={this.props.grid}
            exposed={this.state.exposedSquares.has(square)}
            onExposure={this.onExposure}
            onStep={this.props.onStep} />
        ))}
      </div>
    );
  }

  onExposure(square) {
    /*
    let exposedSquares = new Set(this.state.exposedSquares);

    if (!exposedSquares.has(square)) {
      exposedSquares.add(square);
      this.props.onItemDiscovery(square.type);

      this.setState({exposedSquares: exposedSquares});
    }
    */
    // window.setTimeout(() => {
    let exposedSquares = new Set(this.state.exposedSquares);

    this.props.grid.squares.forEach((square) => {
      if (square.exposed && !this.state.exposedSquares.has(square)) {
        exposedSquares.add(square);
        this.props.onItemDiscovery(square.type);
      }
    });

    this.setState({exposedSquares: exposedSquares});
    // }, 10);
  }
}

class Square extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  getStyle() {
    return {
      width: '' + 100 / this.props.grid.width + '%',
      height: '' + 100 / this.props.grid.height + '%',
      cursor: this.props.exposed ? 'default' : 'pointer',
      fontSize: '' + this.props.grid.width / 4.2 + 'vmin',
    };
  }
  getCssClass() {
    return `Square ${this.props.exposed ? 'exposed' : 'hidden'} ${this.props.square.type}`
  }
  onClick() {
    if (!this.props.square.exposed) {
      this.props.grid.stopExploring = false;
      this.props.grid.currentExplorationCounter = 0;
      this.props.square.expose();
      this.props.onExposure(this.props.square);
      this.props.onStep([this.props.square.x, this.props.square.y]);
    }
  }
  render() {
    return (
      <div
        className={this.getCssClass()}
        style={this.getStyle()}
        onClick={this.onClick}>
        <div style={{opacity: this.props.exposed ? 1 : 0}}>
          {this.props.square.type === '🐑' ?
            <SheepSquare /> :
            <GrassSquare count={this.props.grid.countSheepSquaresAdjacentTo(this.props.square)} />}
        </div>
      </div>
    )
  }
}

class SheepSquare extends Component {
  render() {
    return (
      <div>🐑</div>
    )
  }
}
class GrassSquare extends Component {
  getCountColor() {
    switch (this.props.count) {
      case 8: return 'firebrick'
      case 7: return 'sienna'
      case 6: return 'peru'
      case 5: return 'darkgoldenrod'
      case 4: return 'olive'
      case 3: return 'seagreen'
      case 2: return 'darkcyan'
      case 1: return 'royalblue'
      default: return 'black'
    }
  }
  render() {
    return (
      <div style={{color: this.getCountColor()}}>
        {this.props.count > 0 ? this.props.count : '🌱'}
      </div>
    )
  }
}

export default App;