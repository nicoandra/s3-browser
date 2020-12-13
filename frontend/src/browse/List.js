import React, { useEffect, useState } from "react";
import { get } from './../common'
import { Link } from "react-router-dom";
 

export function List(props) {
  const [bucketList, setBucketList] = useState([])

  useEffect(() => {
    get('/s3').then((res) => {
      console.log(res)
      setBucketList(res)
    })
  }, [])

  return (<table>
    <tr>
      <th>Name</th>
      <th>Created At</th>
    </tr>
      {bucketList.map((bucket) => (
        <tr>
          <td><Link to={`/browse/${bucket.name}`}>{bucket.name}</Link></td>
          <td>{bucket.createdAt}</td>
        </tr>
      ))}
  </table>
  
  );
}