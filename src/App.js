import React, { Component } from 'react';
import Layout from './components/Layout'
import './index.css'

class App extends Component {
  render(){
    return (
      <div className="Container">
        <Layout title='Chat App Baby'/>
      </div>
    );
  }
}

export default App;
