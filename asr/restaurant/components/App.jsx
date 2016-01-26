import React from 'react'
import Influx from 'react-influx'
import OrderList from './views/OrderList.jsx'
import Dispatcher from '../dispatchers/Dispatcher'
import TabbedPane from './views/general/TabbedPane.jsx'
import Header from './views/elements/Header.jsx'

class App extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM);
  }

  render() {

    //<TabbedPane spread={true}
    //            Received={<OrderList status="received"/>}
    //            Progress={<OrderList status="accepted"/>}
    //            Completed={<OrderList status="completed"/>}
    //            tabs={["Received", "Progress", "Completed"]}/>

    return (
        <div className="full flex vertical">
          <Header title="Order" subtitle="#56645">
            <div className="flex" style={{padding:'30px 0'}}>
              <div className="box flex center vertical" style={{borderRight: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <div className="value">$15.35</div>
                <div className="desc">TOTAL COST</div>
              </div>
              <div className="box small flex center vertical">
                <div className="value icon message"></div>
              </div>
            </div>
          </Header>
          <div className="flex status">
            <div className="box event active">RECEIVED</div>
            <div className="box event">COOKING</div>
            <div className="box event">COMPLETE</div>
          </div>
          <div className="full" style={{padding:15,overflow:'scroll',background:"#222"}}>
            <div className="item flex">
              <div className="box flex quantity center vertical">1</div>
              <div className="box flex name center vertical">Big Combo Box</div>
              <div className="box flex cost center right vertical">$15.00</div>
            </div>
            <div className="item flex">
              <div className="box flex quantity center vertical">1</div>
              <div className="box flex name center vertical">Large Fries</div>
              <div className="box flex cost center right vertical">$5.60</div>
            </div>
            <div className="item flex">
              <div className="box flex quantity center vertical">1</div>
              <div className="box flex name center vertical">Big Combo Box</div>
              <div className="box flex cost center right vertical">$15.00</div>
            </div>
            <div className="item flex">
              <div className="box flex quantity center vertical">1</div>
              <div className="box flex name center vertical">Large Fries</div>
              <div className="box flex cost center right vertical">$5.60</div>
            </div>
          </div>
          <div style={{padding:"0px 20px",background:"#222"}}>
            <div className="floater">
              <div className="flex">
                <div className="button box dim">DECLINE</div>
                <div className="button box green">ACCEPT</div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default App

