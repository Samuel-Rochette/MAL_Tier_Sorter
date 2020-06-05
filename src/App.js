import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Partition } from "./partition";
import { SortingService } from "./sorting-service";
import * as jikanjs from "jikanjs";

let i = localStorage.getItem("MAL_Tier_i") || 0;
let j = localStorage.getItem("MAL_Tier_j") || 0;
let temp = JSON.parse(localStorage.getItem("MAL_Tier_Temp")) || [];

jikanjs.loadUser("Shining_Boy", "animelist", "completed").then((response) => {
    // console.log(response);
}).catch((err) => {
    console.error(err);
});

function App() {
  const sortingService = new SortingService();
  const [queue, setQueue] = useState(JSON.parse(localStorage.getItem("MAL_Tier_Queue")) || []);
  const [left, setLeft] = useState(JSON.parse(localStorage.getItem("MAL_Tier_Left")) || {});
  const [right, setRight] = useState(JSON.parse(localStorage.getItem("MAL_Tier_Right")) || {});
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [formError, setFormError] = useState(null)
  const { register, handleSubmit, errors } = useForm();

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

      setMax(max - 1);

      if (!queue[0].items[i] || !queue[rightIndex].items[j]) {
        if (queue[0].items[i]) {
          queue[0].items.forEach(e => {
            if (
              sortingService.findWithAttr(
                temp,
                "title",
                e.title
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
                "title",
                e.title
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
        setQueue(splicedQueue);
        setMergeValues();
      }
    };
  };

  const openTab = url => {
    return function() {
      window.open(url, '_blank');
    }
  }

  const setMergeValues = useCallback(() => {
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

    setMin(i >= j ? min - i : min - j);
    setMax(max - i - j);
  }, [queue, sortingService]);

  const submitProfile = data => {
    jikanjs.loadUser(data.profile, "animelist", data.state).then((res) => {
      let list = new Partition(null, res.anime);
      let queue = sortingService.createQueue(list, [], true);
      if (queue.length > 1 ) {
        setQueue(queue);
        setMergeValues();
        setFormError(null);
        setLeft(queue[0].items[i]);
        setRight(
          queue[sortingService.findWithAttr(queue, "id", queue[0].id + 1)]
            .items[j]
        );
      } else {
        setQueue([]);
        setFormError(true);
      }
    }).catch((err) => {
      console.log(err)
      setQueue([]);
      setFormError(true);
    });
  };

  const saveQueue = () => {
    return () => {
      localStorage.setItem("MAL_Tier_Queue", JSON.stringify(queue));
      localStorage.setItem("MAL_Tier_Left", JSON.stringify(left));
      localStorage.setItem("MAL_Tier_Right", JSON.stringify(right));
      localStorage.setItem("MAL_Tier_i", i);
      localStorage.setItem("MAL_Tier_j", j);
      localStorage.setItem("MAL_Tier_Temp", JSON.stringify(temp));
      alert("Rankings Saved")
    }
  }

  const clearStorage = () => {
    return () => {
      localStorage.clear();
      alert("Rankings Deleted");
    }
  }

  useEffect(() => {
    setMergeValues()
  }, [setMergeValues]);

  return (
    <div className="container">
      <h1 className="header blue">MAL Tier List Sorter</h1>
      <div>
        <input className="button button-save success" type="button" onClick={saveQueue()} value="SAVE" />
        <input className="button button-clear warning" type="button" onClick={clearStorage()} value="CLEAR" />
      </div>
      {queue.length === 1 ? (
        <div>
          {queue[0].items.map((e, i) => {
            return (
              <div className="card list-card row" onClick={openTab(e.url)}>
                <h4 className="list-index"><b>{i + 1}</b></h4>
                <h4 className="list-title"><b>{e.title}</b></h4>
                <img className="list-image" src={e.image_url} alt={'image ' + i} />
              </div>
            )})
          }
        </div>
      ) : queue.length > 0 ? (
        <div>
          <div className="center card-container row">
            <div className="card" onClick={step(true)}>
              <img className="card-image" src={left.image_url} alt="left-card" />
              <div className="card-content">
                <h4><b>{left.title}</b></h4>
              </div>
            </div>
            <div className="card" onClick={step(false)}>
              <img className="card-image" src={right.image_url} alt="right-card" />
              <div className="card-content">
                <h4><b>{right.title}</b></h4>
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
            placeholder="MAL Username"
            ref={register({ required: {
                value: true,
                message: "Username is required"
              }
            })}
          />
          <select className="form-select" name="state" defaultValue="2" ref={register}>
            <option value="completed">Completed</option>
            <option value="all">All</option>
            <option value="watching">Watching</option>
            <option value="onhold">On Hold</option>
            <option value="dropped">Dropped</option>
            <option value="ptw">Plan To Watch</option>
          </select>
          <input className="button success" type="submit" value="SUBMIT" />
          {(errors.profile || formError) && <b className="row form-error">Invalid Input</b>}
        </form>
      )}
    </div>
  );
}

export default App;
