# ad-b2c-pinger

A node js based application to ping Azure functions in a scheduled interval to keep the function warm and avoid any cold starts.

## Description

Azure function hosted in Consumption plan will take some time to startup, if its not used for some time. This phenomenon is called [cold start](https://azure.microsoft.com/en-in/blog/understanding-serverless-cold-start/).

One way of keeping the function warm is by pinging http triggered end point in a periodic interval or can use other hosting plan like Premium, etc.

We can use Azure logic apps to ping an end point in periodic interval but one short coming I could see with Logic app, is to call an [Azure AD B2C](https://azure.microsoft.com/en-in/services/active-directory-b2c/) authenticated end point.

## What this pinger does?

This pinger will ping configured list of urls in configured intervals with ad b2c provided bearer token. Any Azure functions protected with Azure AD Authentication cant be called without a valid token issued by Azure AD B2C.

This pinger will rely several configurations, will come to that later.

Lets see some of the environment variables used by this program

NODE*ENV=DEV or PROD `If NODE*ENV is DEV then scheduled job to ping the urls will be disabled.`

PORT=6420 `Port in which the application listen`

SCHEDULED\*HRS=7-22 `Hours the scheduled job run, for e.g. above configuration set scheduler to run from 7am to 10pm`

INTERVAL\*IN_MIN=1 `At what interval the scheduler should ping the urls.`

API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUz `This is an optional variable. If this variable is set then any http request to this pinger should have a header named api_key with the configured value. This is just to secure the end points with some basic security.`

## How to configure the pinger

Clone the repo and run `npm start`

Open your favourite http client and fire a request to http://localhost:6420/test. The response will indicate the required configs and how to update the configs.

```javascript
{
    "urls": {
        "exist": true,
        "to_update": {
            "api": "/save/urls",
            "method": "POST",
            "sample_body": [
                "url_1",
                "url_2"
            ]
        }
    },
    "b2c_config": {
        "exist": true,
        "to_update": {
            "api": "/save/b2cconfig",
            "method": "POST",
            "sample_body": {
                "client_id": "id from azure ad b2c",
                "client_secret": "secret from azure ad b2c",
                "user_flow_policy": "B2C_1_signupsignin",
                "token_uri": "https://contoso.b2clogin.com/contoso.onmicrosoft.com/oauth2/v2.0/token"
            }
        }
    },
    "tokens": {
        "exist": true,
        "last_refreshed": "Invalid Date",
        "to_update": {
            "api": "/save/login/tokens",
            "method": "POST",
            "sample_body": {
                "refresh_token": "initial refresh token received from azure ad b2c",
                "access_token": "optional initial access token received from azure ad b2c",
                "expires_on": "optional expiry of access_token received from azure ad b2c, e.g. 1578036500"
            }
        }
    },
    "scheduler": {
        "scheduled_hrs": "7-22",
        "url_invocation_interval_in_min": "5"
    },
    "test_url_invocation": {
        "status": "success"
    }
}
```
