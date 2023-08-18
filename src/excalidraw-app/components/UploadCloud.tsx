import React, { useState } from "react";
import "../index.scss"; // 引入样式文件
import {
  fetchData,
  getData,
  encodeToBase64,
  copyToClipboard,
  getExcalidrawIndexDbFiles,
  getIndexDbFiles,
} from "../data/CloudData";

export const UploadLocalData = ({ style }: { style?: React.CSSProperties }) => {
  const [inputValue, setInputValue] = useState("");

  const handleUploadClick = () => {
    if (!inputValue) {
      alert("请输入远程路径！！！");
      return;
    }
    const data = window.localStorage;
    fetchData(JSON.stringify(data), inputValue); // Call the fetchData function to make the request
    getExcalidrawIndexDbFiles(`${inputValue}-files`);
  };

  const handleCurUploadClick = () => {
    // 获取当前画布名称
    const data = window.localStorage;
    const excalidraw_container_name = data.excalidraw_container_name;
    const uploadPath = `share/${encodeToBase64(excalidraw_container_name)}`;
    const excalidraw_container_data = data[excalidraw_container_name];
    const reqData: { [key: string]: any } = {};
    reqData[excalidraw_container_name] = excalidraw_container_data;
    console.log(`${window.location.origin}/${uploadPath}`);
    copyToClipboard(`${window.location.origin}/${uploadPath}`);
    fetchData(JSON.stringify(reqData), uploadPath);
    getExcalidrawIndexDbFiles(`${uploadPath}-files`);
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const syncData = () => {
    getData(inputValue, false);
    getIndexDbFiles(`${inputValue}-files`);
  };

  return (
    <div>
      <button onClick={handleUploadClick} className="button">
        上传
      </button>
      <button onClick={syncData} className="button">
        同步
      </button>
      <button onClick={handleCurUploadClick} className="button">
        分享
      </button>
      <input
        placeholder="远程路径"
        value={inputValue}
        onChange={handleInputChange}
        className="input"
      />
    </div>
  );
};
