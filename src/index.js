// const isResumeSupported = window.Blob && window.Blob.prototype.slice;

function applyRequestHeaders(req, headers) {
  if (typeof headers === 'object') {
    Object.keys(headers).forEach((key) => {
      req.setRequestHeader(key, headers[key]);
    });
  }
}

export const upload = (
  url,
  {
    file,
    fieldName = 'file',
    headers,
    responseType = 'json',
    withCredentials = false,
    data = new FormData(),
    onProgress
  } = {}
) =>
  new Promise((resolve, reject) => {
    if (!data.has(fieldName)) {
      data.append(fieldName, file);
    }
    const req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.withCredentials = withCredentials;
    req.responseType = responseType;
    applyRequestHeaders(req, headers);
    req.addEventListener('load', () => {
      if (req.status >= 200 && req.status < 300) {
        resolve(req.response);
      }
    });
    req.upload.addEventListener('progress', (ev) => {
      if (onProgress) {
        onProgress(ev);
      }
    });
    req.addEventListener('error', reject);
    req.addEventListener('abort', reject);
    req.send(data);
  });

export const download = (url, {headers, responseType = 'blob', withCredentials = false, onProgress} = {}) =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.withCredentials = withCredentials;
    req.responseType = responseType;
    applyRequestHeaders(req, headers);
    req.addEventListener('load', () => {
      if (req.status >= 200 && req.status < 300) {
        resolve(req.response);
      }
    });
    req.addEventListener('progress', (ev) => {
      if (onProgress) {
        onProgress(ev);
      }
    });
    req.addEventListener('error', reject);
    req.addEventListener('abort', reject);
    req.send();
  });

export const uploadObjectURL = (url, objectURL, {filename, lastModified, type, ...otherProps}) =>
  download(objectURL).then((blob) => {
    const file = new File([blob], filename, {lastModified, type});
    return upload(url, {file, ...otherProps});
  });

export default upload;
