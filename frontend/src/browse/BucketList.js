import React, { useEffect, useState } from "react";
import { get } from './../common'
import { Link } from "react-router-dom";
import  {Row, Col, Table, TableHeader} from 'react-bootstrap'
 

export function BucketList(props) {
  const [bucketList, setBucketList] = useState([])
  const baseUri = props.baseUri || 'browse'
  const onBucketSelectionChange = props.onBucketSelectionChange || function (bucketName){}

  useEffect(() => {
    get('/s3').then((res) => {
      console.log(res)
      setBucketList(res)
    })
  }, [])

  return (<Row>
    <Col>
    <Table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Created At</th>
      </tr>
      </thead>
      <tbody>
      {bucketList.map((bucket) => (
        <tr>
          <td><Link to={`/${baseUri}/${bucket.name}`} onClick={() => onBucketSelectionChange(bucket.name)}>{bucket.name}</Link></td>
          <td>{bucket.createdAt}</td>
        </tr>
        
      ))}
      </tbody>
  </Table>
  </Col></Row>
  );
}