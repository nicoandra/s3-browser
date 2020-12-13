import React from "react";
import { useInput } from './hooks';
import { postJson } from './../common'
import {
    Redirect
  } from "react-router-dom";
  

export function Credentials(props) {
  const { value:region, bind:bindRegion, reset:resetRegion } = useInput('');
  const { value:accessKeyId, bind:bindAccessKeyId, reset:resetAccessKeyId } = useInput('');
  const { value:secretAccessKey, bind:bindSecretAccessKey, reset:resetSecretAccessKey } = useInput('');
  const { value:setupDone, setValue:setSetupDone} = useInput(false);

  const handleSubmit = async (evt) => {
      evt.preventDefault();
      await postJson('/credentials' , {region, accessKeyId, secretAccessKey}).then(r => {
        resetRegion();
        resetAccessKeyId();
        resetSecretAccessKey();
        setSetupDone(true);
      }).catch(e => {
        setSetupDone(false);
        console.error(e);
      })
  }

  return setupDone ? (<Redirect to="/browse" />) : (
    <form onSubmit={handleSubmit}>
      <label>
        Region:
        <input type="text" {...bindRegion} />
      </label>

      <label>
        Access Key:
        <input type="text" {...bindAccessKeyId} />
      </label>      

      <label>
        Secret Key:
        <input type="text" {...bindSecretAccessKey} />
      </label>

      <input type="submit" value="Submit" />
    </form>
  );
}