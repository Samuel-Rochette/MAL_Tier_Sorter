import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Partition } from "./partition";
import { SortingService } from "./sorting-service";

let i = 0;
let j = 0;
let temp = [];

function App() {
  const [queue, setQueue] = useState([]);
  const [left, setLeft] = useState({});
  const [right, setRight] = useState({});
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const { register, handleSubmit } = useForm();
  const sortingService = new SortingService();

  const step = leftCheck => {
    return function() {
      let rightIndex = sortingService.findWithAttr(
        queue,
        "id",
        queue[0].id + 1
      );

      if (leftCheck) {
        temp.push(left);
        i += 1;
        if (queue[0].items[i]) {
          setLeft(queue[0].items[i]);
        }
        if (i >= j + 1) {
          setMin(min - 1);
        }
      } else {
        temp.push(right);
        j += 1;
        if (queue[rightIndex].items[j]) {
          setRight(queue[rightIndex].items[j]);
        }
        if (j >= i + 1) {
          setMin(min - 1);
        }
      }

      setMax(max -1);

      if (!queue[0].items[i] || !queue[rightIndex].items[j]) {
        if (queue[0].items[i]) {
          queue[0].items.forEach(e => {
            if (
              sortingService.findWithAttr(
                temp,
                "anime_title",
                e.anime_title
              ) === -1
            ) {
              temp.push(e);
            }
          });
        } else {
          queue[rightIndex].items.forEach(e => {
            if (
              sortingService.findWithAttr(
                temp,
                "anime_title",
                e.anime_title
              ) === -1
            ) {
              temp.push(e);
            }
          });
        }
        let index = sortingService.findWithAttr(queue, "id", queue[0].parentId);
        let splicedQueue = [...queue];
        splicedQueue[index].items = temp;
        temp = [];
        i = 0;
        j = 0;
        splicedQueue.splice(rightIndex, 1);
        splicedQueue.splice(0, 1);
        if (
          splicedQueue[
            sortingService.findWithAttr(
              splicedQueue,
              "id",
              splicedQueue[0].id + 1
            )
          ]
        ) {
          setLeft(splicedQueue[0].items[i]);
          setRight(
            splicedQueue[
              sortingService.findWithAttr(
                splicedQueue,
                "id",
                splicedQueue[0].id + 1
              )
            ].items[j]
          );
        }
        setMergeValues(splicedQueue);
        setQueue(splicedQueue);
      }
    };
  };

  const openTab = url => {
    return function() {
      window.open(`https://myanimelist.net${url}`, '_blank');
    }
  }

  const setMergeValues = queue => {
    let min = 0;
    let max = 0;

    for(let i = 0; i < queue.length - 1; i += 2) {
      let rightIndex = sortingService.findWithAttr(
        queue,
        "parentId",
        queue[i].parentId
      );

      min += Math.min(queue[i].items.length, queue[rightIndex].items.length)
      max += queue[i].items.length + queue[rightIndex].items.length - 1
    }

    setMin(min);
    setMax(max);
  }

  const submitProfile = data => {
    const getProfile = async () => {
      const response = await axios.get(
        `/animelist/${data.profile}?status=${data.state}`
      );
      let min = response.data.indexOf("data-items") + 12;
      let max = response.data.indexOf("<tbody>") - 11;
      let temp = response.data
        .substring(min, max)
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&");
      if (temp.indexOf("!DOCTYPE") === -1) {
        let list = new Partition(null, JSON.parse(temp));
        let queue = sortingService.createQueue(list, [], true);
        setQueue(queue);
        console.log(queue);
        setMergeValues(queue);
        setLeft(queue[0].items[i]);
        setRight(
          queue[sortingService.findWithAttr(queue, "id", queue[0].id + 1)]
            .items[j]
        );
      }
    };
    getProfile();
  };

  return (
    <div className="container">
      <h1 className="header blue">MAL Tier List Sorter</h1>
      {queue.length === 1 ? (
        <div>
          {queue[0].items.map((e, i) => {
            return (
              <div className="card list-card row" onClick={openTab(e.anime_url)}>
                <h4 className="list-index"><b>{i + 1}</b></h4>
                <h4 className="list-title"><b>{e.anime_title}</b></h4>
                <img className="list-image" src={e.anime_image_path} alt={'image ' + i} />
              </div>
            )})
          }
        </div>
      ) : queue.length > 0 ? (
        <div>
          <div className="center card-container row">
            <div className="card" onClick={step(true)}>
              <img className="card-image" src={left.anime_image_path} alt="left-card" />
              <div className="card-content">
                <h4><b>{left.anime_title}</b></h4>
              </div>
            </div>
            <div className="card" onClick={step(false)}>
              <img className="card-image" src={right.anime_image_path}alt="right-card" />
              <div className="card-content">
                <h4><b>{right.anime_title}</b></h4>
              </div>
            </div>
          </div>
          <p className="merge-count blue"><b>Min: </b>{min}<br /><b>Max: </b>{max}</p>
        </div>
      ) : (
        <form className="center" onSubmit={handleSubmit(submitProfile)}>
          <input
            className="form-input"
            type="text"
            name="profile"
            ref={register({ required: true })}
          />
          <select className="form-select" name="state" defaultValue="2" ref={register}>
            <option value="7">All</option>
            <option value="1">Watching</option>
            <option value="2">Completed</option>
            <option value="3">On Hold</option>
            <option value="4">Dropped</option>
            <option value="6">Plan To Watch</option>
          </select>
          <input className="button success" type="submit" value="SUBMIT" />
        </form>
      )}
    </div>
  );
}

export default App;
