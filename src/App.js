import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Partition } from "./partition";
import { SortingService } from "./sorting-service";

let i = localStorage.getItem("MAL_Tier_i") || 0;
let j = localStorage.getItem("MAL_Tier_j") || 0;
let temp = JSON.parse(localStorage.getItem("MAL_Tier_Temp")) || [];

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
        setQueue(splicedQueue);
        setMergeValues();
      }
    };
  };

  const openTab = url => {
    return function() {
      window.open(`https://myanimelist.net${url}`, '_blank');
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
  }, [queue, sortingService])

  const submitProfile = async data => {
    try {
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
        if(queue.length > 1){
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
      }
    }
    catch {
      setQueue([]);
      setFormError(true);
    }
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
      alert("Rankings Deleted")
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
            placeholder="MAL Username"
            ref={register({ required: {
                value: true,
                message: "Username is required"
              }
            })}
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
          {(errors.profile || formError) && <b className="row form-error">Invalid Input</b>}
        </form>
      )}
    </div>
  );
}

export default App;
