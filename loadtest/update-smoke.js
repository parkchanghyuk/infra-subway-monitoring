import http from 'k6/http';
import {check, sleep} from 'k6';

export let options = {
  vus: 2,
  duration: '10s',

  thresholds: {
    http_req_duration: ['p(99)<1000'],
  },
};


const BASE_URL = 'https://chaeyun17.p-e.kr';
const email = 'chaeyun17@github.com';
const password = '12345';
const params = {headers: {'Content-Type': 'application/json'}};
const loginPayload = JSON.stringify({email, password});

export default function () {
  const loginResponse = http.post(`${BASE_URL}/login/token`,
      loginPayload, params).json();
  check(loginResponse, {
    'logged in successfully': response => response.accessToken !== '',
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${loginResponse.accessToken}`,
      'Content-Type': 'application/json',
    }
  };
  const retrievedResponse = http.get(`${BASE_URL}/members/me`, authHeaders).json();
  check(retrievedResponse, {'retrieved member': obj => obj.id !== 0});

  const updatedResponse = http.put(`${BASE_URL}/members/me`,
      JSON.stringify({email, password, age: 10}), authHeaders);
  check(updatedResponse,
      {'updated member': response => response.status === 200}
  );
  sleep(1);
}