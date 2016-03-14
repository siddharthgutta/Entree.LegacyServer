/* eslint-disable */

/**
 * This is experimental
 */

import React from 'react';
import Influx from 'react-influx';
import _ from 'underscore';
import DepGraph from 'dependency-graph';
import Chance from 'chance';
import {ifcat} from '../../libs/utils';

const chance = new Chance();

String.prototype.capitalize = function () {
  return this.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
};

class Item extends Influx.Component {
  constructor(props, context) {
    super(props, context);
  }

  _handleClick() {
    const category = this.refs.category.value;
    const name = this.refs.name.value;
    const description = this.refs.description.value;
    const cost = this.refs.cost.value;

    this.props.addItem(this.props._id, {category, name, description, cost});
  }

  render() {
    const items = this.props.items;
    const item = this.props.items[this.props._id];

    const parents = this.props.parents.concat([this.props._id]);
    let categories = this.props.categories.concat([item.category]);
    let deps = this.props.graph.dependenciesOf(item._id);

    // remove not immediates
    deps = deps.filter(_id => item.immediates.includes(_id));
    deps = _.difference(deps, parents);
    deps = deps.filter(_id => !categories.includes(items[_id].category));

    window.graph = this.props.graph;
    window.items = this.props.items;

    const all = Object.keys(this.props.items);
    let sdeps = _.difference(all, _.filter(all, _d => this.props.graph.dependenciesOf(_d).includes(item._id)));
    sdeps = _.difference(sdeps, parents);
    sdeps = _.difference(sdeps, item.immediates);
    sdeps = sdeps.filter(_id => !categories.includes(items[_id].category));

    // parents = parents.concat([this.props._id]);

    return (
      <div style={{marginLeft: 40, paddingTop: (this.props.child ? 5 : 15)}}>
        <div className='item flex'>
          <div className='box' style={{flex: 0}}>
            <input type='checkbox' checked={this.props.child}/>
          </div>
          <div className='box' style={{flex: 0, marginLeft: 10}}>
            <input className='input' placeholder='category' defaultValue={item.cost}/>
          </div>
          <div className='box' style={{maxWidth: 550}}>
            <div className='flex'>
              <div className='box'>
                <span className='tag'>{item.category}</span>
                <span className='name'>{item.name.capitalize()}</span>
                <span className={ifcat('name', {hide: !this.props.child})} style={{fontSize: 13}}>▾</span>
              </div>
            </div>
            <div className='box' style={{flex: 0}}>
              <div className='description' placeholder='category'>{item.description}</div>
            </div>
          </div>
        </div>
        <div className={ifcat({hide: this.props.child})} style={{marginLeft: 20, marginBottom: 10}}>
          <span className='arrow'>↳</span>
          <input className='input' ref='category' placeholder='category'/>
          <input className='input' ref='name' placeholder='name'/>
          <input className='input' ref='description' placeholder='description'/>
          <input className='input' ref='cost' placeholder='cost'/>
          <button onClick={() => this._handleClick()}>+</button>
        </div>
        {_.map(sdeps, _id => {
          const item = this.props.items[_id];
          return (
            <div key={_id} className='item flex' style={{marginLeft: 40}}>
              <div className='box' style={{flex: 0}}>
                <input type='checkbox' checked={this.props.child}/>
              </div>
              <div className='box' style={{flex: 0, marginLeft: 10}}>
                <input className='input' placeholder='category' defaultValue={item.cost}/>
              </div>
              <div className='box' style={{maxWidth: 550}}>
                <div className='flex'>
                  <div className='box'>
                    <span className='tag'>{item.category}</span>
                    <span className='name'>{item.name.capitalize()}</span>
                    <span className={ifcat('name', {hide: !this.props.child})} style={{fontSize: 13}}>▾</span>
                  </div>
                </div>
                <div className='box' style={{flex: 0}}>
                  <div className='description' placeholder='category'>{item.description}</div>
                </div>
              </div>
            </div>
          );
        })}
        {_.map(deps, _id => {
          return (
            <Item key={_id}
              {...this.props} child={true} _id={_id} inset={this.props.inset + 1} parents={parents}
                  categories={categories}/>
          );
        })}
      </div>
    );
  }
}

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.graph = new DepGraph.DepGraph();
    this.graph.addNode('base');

    this.state = {items: {}};
  }

  _addItem(parent, item) {
    const items = this.state.items;
    item.immediates = item.immediates || [];

    item.name = item.name || chance.word();
    item.category = item.category || chance.word();
    item.description = item.description || chance.sentence();
    item.cost = item.cost || chance.floating({fixed: 2, min: 0, max: 100});

    if (!item._id) item._id = item.name + item.category;
    items[item._id] = item;

    if (!items[parent]) {
      items[parent] = {immediates: []};
    }

    items[parent].immediates.push(item._id);

    if (!this.graph.hasNode(parent)) this.graph.addNode(parent);
    if (!this.graph.hasNode(item._id)) this.graph.addNode(item._id);
    this.graph.addDependency(parent, item._id);

    return this.setState({items});
  }

  _addRootItem() {
    const category = this.refs.category.value;
    const name = this.refs.name.value;
    const description = this.refs.description.value;
    const cost = this.refs.cost.value;

    this._addItem('base', {category, name, description, cost});
  }

  render() {
    const sorted = this.graph.dependenciesOf('base');

    sorted.sort((a, b) => this.graph.dependenciesOf(b).length - this.graph.dependenciesOf(a).length);

    return (
      <div className='full' style={{overflow: 'scroll'}}>
        <div>
          <div style={{padding: 10, boxShadow: '0 5px 10px rgba(0,0,0,0.08)'}}>
            <input className='input' ref='category' placeholder='category' defaultValue={this.props.category}/>
            <input className='input' ref='name' placeholder='name' defaultValue={this.props.name}/>
            <input className='input' ref='description' placeholder='description' defaultValue={this.props.description}/>
            <input className='input' ref='cost' placeholder='cost' defaultValue={this.props.cost}/>
            <button onClick={() => this._addRootItem()}>+</button>
          </div>
          {_.map(sorted, _id => (
            <Item key={_id}
                  _id={_id}
                  parents={['base']}
                  categories={[]}
                  items={this.state.items}
                  addItem={(...args) => this._addItem(...args)}
                  graph={this.graph}
                  expand={true}
                  inset={1}/>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
