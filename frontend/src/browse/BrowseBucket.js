import React, { useEffect, useState } from "react";
import { get, getStream } from './../common'
import { Link, useParams } from "react-router-dom";

 
export function BrowseBucket(props) {
  const { bucketName: bucketNameProps, prefixes:currentPrefixesProps } = useParams()
  const [contents, setContents] = useState([]);
  const [prefixes, setPrefixes] = useState([]);
  const [currentPrefixes, setCurrentPrefixes] = useState(currentPrefixesProps || '');
  const [bucketName, ] = useState(bucketNameProps);

  const fetchContent = () => {
    let prefixesUri = currentPrefixes?.split('/').join('|')
    prefixesUri = prefixesUri ? '/' + prefixesUri : ''
    get(`/s3/${bucketName}${prefixesUri}`).then((res) => {
      setContents(res.contents)
      setPrefixes(res.prefixes)
    })
  }

  useEffect(() => {
    fetchContent()
  }, [props.bucketName, currentPrefixes, props.prefixes])


  const backLink = <BackLink onClick={(evt) => removeLastPrefix()} currentPrefixes={currentPrefixes} bucketName={bucketName}/>

  return (<div>
    <BrowseBucketHeader bucketName={bucketName} currentPrefixes={currentPrefixes} itemCount={contents.length} onCurrentPrefixChange={(prefixes) => setCurrentPrefixes(prefixes)}/>
    <table>
      <tr>
        <th>Key</th>
        <th>Last Update</th>
        <th>Size</th>
      </tr>

      {backLink ? 
      <tr>
          <td>{backLink}</td>
          <td></td>
          <td></td>
      </tr> : ''}


        {prefixes.map((prefix) => (
          <tr>
          <td><PrefixLink bucketName={bucketName} prefix={prefix} currentPrefixes={currentPrefixes} onClick={(evt) => { addPrefix(prefix)}}/></td>
          <td></td>
          <td></td>
        </tr>          
        ))}

        {contents.map((row) => (
          <tr>
            <td><DownloadLink bucketName={bucketName} objectKey={row.key} friendlyName={row.friendlyName} /></td>
            <td>{row.lastUpdate}</td>
            <td>{row.size}</td>
          </tr>
        ))}
    </table>
    </div>
  );


  function removeLastPrefix() {
    const prefixes = currentPrefixes.split('|')
    setCurrentPrefixes(prefixes.slice(0, -1).filter(s => s.length).join('|'))
  }  

  function addPrefix(prefix) {
    const prefixes = currentPrefixes.split('|')
    prefixes.push(prefix.replace(/\//g, ''))
    setCurrentPrefixes(prefixes.filter(s => s.length).join('|'))
  }
}

function DownloadLink(props) {
  function download() {
    const path = ['', 's3', encodeURIComponent(props.bucketName), encodeURIComponent(props.objectKey), 'download'].join('/')
    getStream(path).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = props.friendlyName;
      a.click();
    });
  }

  return (<button onClick={download}>{props.friendlyName}</button>)
}

function BackLink(props) {
  const { bucketName, currentPrefixes } = props
  let prefixes = currentPrefixes ? currentPrefixes.split('|') : []

  if (prefixes.length === 0) return false

  prefixes = prefixes.slice(0, -1).join('|')
  
  const uri = '/browse/' + bucketName + '/' + (prefixes ? prefixes : '')
  return <Link to={uri} onClick={props.onClick}>..</Link>
}

function PrefixLink(props) {
  const { bucketName, currentPrefixes, prefix } = props
  const newPrefixes = currentPrefixes ? currentPrefixes.split('|') : []
  newPrefixes.push(prefix)

  const uri = '/browse/' + bucketName + '/' + (currentPrefixes ? currentPrefixes + '|' : '') + (prefix.length ? prefix : '')
  return <Link to={uri} onClick={props.onClick}>{(prefix.length ? prefix : '..')}</Link>
}

export function BrowseBucketHeader(props) {
  const {bucketName, itemCount} = props
  const prefixes = props.currentPrefixes.split('|')

  const prefixPath = prefixes.map((v, i, arr) => {
    return arr.filter((_v, _i) => _i <= i)
  }).map((c) => {
    const prefixes = c.join('|')
    return {
      link: ['', 'browse', bucketName, prefixes].join('/'), text: c.slice(-1).pop(), prefixes
    }
  }).map((c) => {
    return (<span><Link to={c.link} onClick={() => {props.onCurrentPrefixChange(c.prefixes)}}>{c.text}</Link> &gt; </span>)
  })

return (<div> {bucketName} {prefixPath} ({itemCount} items)</div>)

}
