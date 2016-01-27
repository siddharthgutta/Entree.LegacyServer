import React from 'react'
import Influx from 'react-influx'
import OrderList from '../elements/OrderList.jsx'
import Dispatcher from '../../../dispatchers/Dispatcher'
import TabbedPane from '../../views/general/TabbedPane.jsx'
import Header from '../../views/elements/Header.jsx'
import {ifcat} from '../../../libs/utils'
import moment from 'moment'

class OrderFocus extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {showDialog: false, time: 0};
  }

  componentDidMount() {
    //Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM);
    document.body.classList.add(this.props.color);
  }

  _addTime(time) {
    this.setState({time: this.state.time + time});
  }

  _handleAccept(a) {
    this.setState({showDialog: a});
  }

  _handleInput(e) {
    var val = e.target.value;
    this.setState({time: Math.abs(isNaN(val) ? 0 : Number(val))});
  }

  render() {
    const {order} = this.props;

    return (
        <div className="full">
          <div className="full-abs">
            <div className="full flex vertical">
              <Header title={"#" + order.id} subtitle={"ORDER"} style={{minHeight:185}}>
                <div className="flex" style={{padding:'30px 0'}}>
                  <div className="box flex center vertical" style={{borderRight: '1px solid rgba(255, 255, 255, 0.1)'}}>
                    <div className="value">${order.cost}</div>
                    <div className="desc">TOTAL COST</div>
                  </div>
                  <div className="box small flex center vertical">
                    <div className="value icon message"></div>
                  </div>
                </div>
              </Header>
              <TabbedPane spread={true} Items={
              <div className="full  flex vertical">
              <div className="flex status" style={{minHeight:53}}>
                <div className={ifcat("box event", {active: order.status === "received"})}>RECEIVED</div>
                <div className={ifcat("box event", {active: order.status === "accepted"})}>PROGRESS</div>
                <div className={ifcat("box event", {active: order.status === "completed"})}>COMPLETE</div>
              </div>
              <div className="full" style={{padding:"10px 15px 0",overflow:'scroll',background:"rgba(0,0,0,0.7)"}}>
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
              </div>} Details={<div className="full" style={{padding:"30px",overflow:'scroll',background:"rgba(0,0,0,0.7)"}}>
                  <div className="box flex left vertical small info">
                    <div className="value">#{order.id}</div>
                    <div className="desc">ID</div>
                  </div><div className="box flex left vertical small info">
                    <div className="value">{order.name}</div>
                    <div className="desc">NAME</div>
                  </div><div className="box flex left vertical small info hide">
                    <div className="value">{order.status.substring(0, 1).toUpperCase() + order.status.substring(1)}</div>
                    <div className="desc">STATUS</div>
                  </div><div className="box flex left vertical small info">
                    <div className="value">{moment(order.date).calendar()}</div>
                    <div className="desc">DATE</div>
                  </div>
              </div>} tabs={["Items", "Details"]}/>
              <div style={{padding:"0px 20px",background:"rgba(0,0,0,0.7)",minHeight:62}}>
                <div className="floater">
                  <div className="flex">
                    <div className="button box dim">DECLINE</div>
                    <div className="button box green" onTouchTap={this._handleAccept.bind(this, true)}
                         onClick={this._handleAccept.bind(this, true)}>ACCEPT
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={ifcat("full-abs vignette", {hide: !this.state.showDialog})}>
              <div className="dialog center">
                <div className="box flex center vertical" style={{padding:15}}>
                  <div className="value">$15.35</div>
                  <div className="desc">TOTAL COST</div>
                </div>
                <hr />
                <div className="desc bold normal" style={{marginBottom:20}}>Select a preparation time</div>
                <div className="button navy flex center" onTouchTap={this._addTime.bind(this, 1)}
                     onClick={this._addTime.bind(this, 1)}><span
                    className="icon add"/> 1
                  Minute
                </div>
                <div className="button navy flex center" onTouchTap={this._addTime.bind(this, 5)}
                     onClick={this._addTime.bind(this, 5)}><span
                    className="icon add"/> 5
                  Minutes
                </div>
                <div className="button navy flex center" onTouchTap={this._addTime.bind(this, 15)}
                     onClick={this._addTime.bind(this, 15)}><span
                    className="icon add"/> 15
                  Minutes
                </div>
                <div className="desc" style={{marginBottom:10}}>OR</div>
                <input type="number" placeholder="minutes" value={this.state.time}
                       onChange={this._handleInput.bind(this)}/>
                <div className="button">submit</div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default OrderFocus

