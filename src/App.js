import React from 'react';
import './App.css';
import axios from 'axios';
import { Partition } from './partition';
import { SortingService } from './sorting-service'

async function getProfile() {
    try {
        const response = await axios.get('/animelist/Shining_Boy?status=2');
        let min = response.data.indexOf('data-items') + 12;
        let max = response.data.indexOf('<tbody>') - 11;
        let list = JSON.parse(response.data.substring(min,max).replace(/&quot;/g,'"').replace(/&amp;/g,'&'));
        return list;
    } catch (error) {
        console.log(error);
    }
}

let i = 0;
let j = 0;
let left = new Partition(0, []);
let right = new Partition(0, []);
let queue = new Partition(0, []);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            left: {},
            right: {}
        };
        this.sortingService = new SortingService();
    }  

    async componentDidMount() {
        let list = await getProfile();
        let partition = new Partition(0, list);
        //console.log(list);
        queue = this.sortingService.createQueue(partition, [], true);
        //console.log(queue);
        left = queue[0];
        right = queue[this.sortingService.findWithAttr(queue, 'id', left.id + 1)];
        console.log(left);
        console.log(right);
        //this.setSate({ left: left.items[i], right: right.items[j] });
    }

    render() {
        return (
            <div className="App">
                <h4>{this.state.left.anime_title}</h4>
                <button onClick={() => this.step(1, 0, this.state.left)}>Select</button>
                <h4>{this.state.right.anime_title}</h4>
                <button onClick={() => this.step(0, 1, this.state.right)}>Select</button>
            </div>
        );
    }
}

export default App;
