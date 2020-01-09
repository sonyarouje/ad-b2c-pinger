# ad-b2c-pinger

A node js application to ping Azure functions authenticated with Azure AD B2C in a scheduled interval to keep the function warm and avoid cold starts.

## Description

Azure function hosted in Consumption plan will take 8+ seconds to startup, if its not used for some time. This phenomenon is called [cold start](https://azure.microsoft.com/en-in/blog/understanding-serverless-cold-start/).

One way of keeping the function warm is by pinging the http triggered end point in a periodic interval or can use other hosting plan like Premium, etc.

We can use Azure logic apps to ping an end point in periodic interval but one short coming I could see with Logic app, is to call an [Azure AD B2C](https://azure.microsoft.com/en-in/services/active-directory-b2c/) authenticated end point.

## What this pinger does?

This pinger will ping configured list of urls in configured intervals with ad b2c provided bearer token. Any Azure functions protected with Azure AD Authentication cant be called without a valid token issued by Azure AD B2C.

This pinger will rely on several configuration files, will come to that later.

Lets see some of the environment variables used by this application

-   NODE_ENV=DEV or PROD `Can configure different directories to save tokens and config files based on this environment variable`
-   PORT=6420 `Port in which the application listen`
-   SCHEDULED_HRS=7-22 `Hours the scheduled job run, for e.g. above configuration set scheduler to run from 7am to 10pm`
-   INTERVAL_IN_MIN=1 `At what interval the scheduler should ping the urls.`
-   CALL_SCHEDULED_URLS `Value can be true or false. If false then configured urls will not called by the scheduler.`
-   API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUz `This is an optional variable. If this variable is set then any http request to this pinger should have a header named api_key with the configured value. This is to secure the end points with some basic security.`
-   SHOW_CONSOLE_LOG `true or false decides whether to show the logs in console`
-   CREATE_LOG_SYMLINK `true or false. Logging uses rotating log files, if the environment variable is true then create log.log symlink to the active log file`

## How to configure the pinger?

Clone the repo and run `npm start`

Open your favourite http client and fire a request to http://localhost:6420/test. The response will indicate the status of required configs and how to update the configs.

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

Lets analyze the response

### urls

`exist:true` means already the urls to ping is configured.

To update the urls we can send a POST request to `http://localhost:6420/save/urls` with an array of urls as body.

Like urls we need to configure

### b2c_config

and

### tokens

Once all the configuration in place call http://localhost:6420/test api again. This time the test call will invoke the first url from the url list with a bearer token received from Azure AD B2C. If all go fine `test_url_invocation` will show the status as success.

We can also test a single url by calling test end point with url as query param. e.g. http://localhost:6420/test?url=https://myfunction.azurewebsite.net/ping Response

```
{
    "url": "https://myfunction.azurewebsite.net/ping",
    "status": "success"
}
```

## How pinger works?

Pinger use the refresh_token updated via `/save/login/tokens` and send a [request to Azure AD b2c](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-access-tokens) (using the configs configured via post request to `/save/b2cconfig`). The response from the AD b2c contains the access_token, refresh_token, expiration time etc. Once the pinger receives a valid access_token it saves the data to a file and will reuse it to invoke the configured urls. Once the access_token expires, pinger will refetch a valid access_token using the refresh_token. Ideally pinger needs to be configured with a valid refresh_token once.

## Dockerizing pinger

1. Clone the repo
2. Goto docker directory
3. Run `docker-compose up`
4. Test the pinger by sending http request to http://localhost:6420/test

Note: The source code will get cloned every time we run `docker-compose up` but the configs and logs are persisted using a volume mount.
