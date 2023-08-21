import { LocalData } from "./LocalData";
import { getAllContainerListElementsFromStorage } from "./localStorage";
import { isInitializedImageElement } from "../../element/typeChecks";
import { FileId } from "../../element/types";

export const fetchData = async (data: any, path: any) => {
  const headers = new Headers();

  const requestOptions: RequestInit = {
    method: "PUT",
    headers,
    body: data, // Replace with your data to send
  };

  try {
    const uploadPath = `${
      process.env.REACT_APP_SYSTEM_WEBDAV_REMOTE_URL
        ? process.env.REACT_APP_SYSTEM_WEBDAV_REMOTE_URL
        : process.env.REACT_APP_WEBDAV_REMOTE_URL
    }${path}`;

    await fetch(uploadPath, requestOptions);
    alert("上传成功");
    // Process the response as needed
  } catch (error) {
    // Handle error
    console.error("Error fetching data:", error);
  }
};

export const getData = async (
  path: string,
  shareType: boolean = true,
  backupData: boolean = true,
) => {
  // console.log(path);

  let storgePath = path;
  let sharePath = false;

  if (
    shareType ||
    (window.location.search &&
        window.location.search.startsWith("?link="))
  ) {
    storgePath = window.location.search.slice(6);
    sharePath = true;
  }
  //   console.log(storgePath);

  if (!storgePath) {
    return;
  }

  const headers = new Headers();
  // headers.append('Authorization', 'Basic ' + window.btoa(inputValue)); // Replace with your actual token

  const requestOptions: RequestInit = {
    method: "GET",
    headers,
  };

  try {
    const response = await fetch(
      `${
        process.env.REACT_APP_SYSTEM_WEBDAV_REMOTE_URL
          ? process.env.REACT_APP_SYSTEM_WEBDAV_REMOTE_URL
          : process.env.REACT_APP_WEBDAV_REMOTE_URL
      }${storgePath}`,
      requestOptions,
    );
    // console.log(response);
    const responseBody = await response.text(); // Convert response body to text
    // console.log(responseBody); // Process the response body as needed
    const drawData = JSON.parse(responseBody);
    // backup
    const currentLocalData = window.localStorage;
    // Filter and store backup data
    const filteredData: { [key: string]: any } = {};
    for (const key in currentLocalData) {
      if (currentLocalData.hasOwnProperty(key) && key.startsWith("backup")) {
        // 过滤掉以 "backup" 开头的键
        continue;
      }
      filteredData[key] = currentLocalData[key];
    }

    const backupKeys = Object.keys(currentLocalData).filter((key) =>
      key.startsWith("backup"),
    );
    // 删除之前备份数据
    for (const key of backupKeys) {
      currentLocalData.removeItem(key);
    }
    // 存储新的 "backup" 数据
    const newBackupKey = `backup${new Date().getTime()}`;
    currentLocalData.setItem(newBackupKey, JSON.stringify(filteredData));
    // 上传到远程
    if (backupData) {
      fetchData(JSON.stringify(filteredData), `backup/${newBackupKey}`);
      getExcalidrawIndexDbFiles(`backup/${newBackupKey}-files`)
      console.log("Backup saved:", newBackupKey);
      alert(
        "本地数据已备份远程路径" +
          `backup/${newBackupKey}` +
          "，同步远程数据成功，请切换画布查看效果！！",
      );
    }
    if (sharePath) {
      // 分享单文件 追加
      console.log(currentLocalData.excalidraw_container_list);
      const currentDrawkey = Object.keys(drawData)[0];
      const excalidraw_container_list =
        currentLocalData.excalidraw_container_list;
      let excalidraw_container = new Set();
      if (excalidraw_container_list) {
        console.log(excalidraw_container_list);
        excalidraw_container = new Set(JSON.parse(excalidraw_container_list));
      }
      excalidraw_container.add(currentDrawkey);
    //   excalidraw_container.add('default_canvas');
      console.log(typeof excalidraw_container, excalidraw_container);
      currentLocalData.setItem(
        "excalidraw_container_list",
        JSON.stringify(Array.from(excalidraw_container)),
      );
    } else {
      window.localStorage.clear();
    }
    for (const item in drawData) {
      window.localStorage.setItem(item, drawData[item]);
    }
    window.localStorage.setItem("excalidraw_container_name", "default_canvas");

    // Process the response as needed
  } catch (error) {
    // Handle error
    console.error("Error fetching data:", error);
  }
};

export const encodeToBase64 = (str: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const base64 = btoa(String.fromCharCode(...data));
  return base64;
};

export const copyToClipboard = (text: string): void => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("内容已成功复制到剪贴板");
    })
    .catch((error) => {
      alert(`无法复制内容到剪贴板：${error}`);
    });
};

export const saveCloudIndexDbFiles = (datas: any): void => {
  //     const testData = [{"mimeType":"image/png","id":"1111111","dataURL":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAvCAYAAAAfIcGpAAAAAXNSR0IArs4c6QAAATVJREFUWEftl+GphDAQhDcVaAfagVqBsQM70A5sIXakFWgJWoHYgVaQxwRyHMd5ymFyP94GQkA2mcm3u0KE1lqT5yFY1CVxxuuSLjFexnsLAS6kWzAeHcJ4Ge8tBLiQbsHIffqbQlJKaSnlA38QBJSmqducEtHhs8KagYkwDI0ZrEmSmPXbIZqm0dM0PfZv20bzPJ+eZ03AWBzHZuZ5froPAUJK+famEH82c+k0IkMDBuwKKq/pEp/wXhW6EgciZVlSVVUkhmE4fSo+F9onAZBRSlHf94dhSIuzlum6juzc992YiKKI1nV1J2qvitqo69rcHrldlsW9qBWHoO0KZ3hfk4p8Z1lmPnsThRiqF5i9iqKy27b1KzqOIxVF4VfU5FMIFr3yN/0u5n/gtT8Ir336k5axon/cHP3Ruj/G1AAAAABJRU5ErkJggg==","created":1692371740460,"lastRetrieved":1692371786568}]
  LocalData.fileStorage.saveFiles2({ files: datas });
};

export const getExcalidrawIndexDbFiles = (filePath: string): void => {
  const allContainerListElements = getAllContainerListElementsFromStorage();

  const fileIds =
    // data.scene.elements?.reduce((acc, element) => {
    allContainerListElements?.reduce((acc, element) => {
      if (isInitializedImageElement(element)) {
        return acc.concat(element.fileId);
      }
      return acc;
    }, [] as FileId[]) || [];

  LocalData.fileStorage
    .getFiles(fileIds)
    .then(({ loadedFiles, erroredFiles }) => {
    //   console.log(JSON.stringify(loadedFiles));
      fetchData(JSON.stringify(loadedFiles), filePath);
    });
};

export const getIndexDbFiles = async (filePath: string) => {
  const headers = new Headers();
  // headers.append('Authorization', 'Basic ' + window.btoa(inputValue)); // Replace with your actual token

  const requestOptions: RequestInit = {
    method: "GET",
    headers,
  };

  try {
    const response = await fetch(
      `${
        process.env.REACT_APP_SYSTEM_WEBDAV_REMOTE_URL
          ? process.env.REACT_APP_SYSTEM_WEBDAV_REMOTE_URL
          : process.env.REACT_APP_WEBDAV_REMOTE_URL
      }${filePath}`,
      requestOptions,
    );
    // console.log(response);
    const responseBody = await response.text(); // Convert response body to text
    // console.log(responseBody); // Process the response body as needed
    const dbFiles = JSON.parse(responseBody);
    saveCloudIndexDbFiles(dbFiles);
  } catch (error) {
    // Handle error
    console.error("Error fetching data:", error);
  }
};

export const initExcalidrawFromCloudData = (): void => {
  if (
    window.location.search &&
    window.location.search.startsWith("?link=")
  ) {
    const storgePath = window.location.search.slice(6);
    getData("", true, false);
    getIndexDbFiles(`${storgePath}-files`);
    setTimeout(() => {
        window.location.href = window.location.origin
        alert('获取分享链接成功，请切换画布加载最新效果！！')
    }, 1000);
    // window.open(window.location.origin);
  }
};
