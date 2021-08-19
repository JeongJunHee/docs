# 교차 출처 리소스 공유 (CORS)

`교차 출처 리소스 공유(Cross-Origin Resource Sharing, CORS)` 는 추가 HTTP 헤더를 사용하여, 한 출처에서 실행중인 웹 애플리케이션이 다른 출처의 선택한 자원에 접근할 수 있는 권한을 부여하도록 브라우저에 알려주는 체제이다. 웹 애플리케이션은 리소스가 자신의 출처(도메인, 프로토콜, 포트)와 다를 때 교차 출처 HTTP 요청을 실행한다.

보안 상의 이유로, 브라우저는 스크립트에서 시작한 교차 출처 HTTP 요청을 제한한다.

CORS 체제는 브라우저와 서버 간의 안전한 교차 출처 요청 및 데이터 전송을 지원한다. 최신 브라우저는 `XMLHttpRequest` 또는 `Fetch` 와 같은 API에서 CORS를 사용하여 교차 출처 HTTP 요청의 위험을 완화한다.

`교차 출처 공유 표준` 은 다음과 같은 경우에 사이트간 HTTP 요청을 허용한다.

- `XMLHttpRequest` 와 `Fetch API` 호출
- 웹 폰트(CSS 내 `@font-face` 에서 교차 도메인 폰트 사용 시)
- WebGL 텍스쳐
- `drawImage()` 를 사용해 캔버스에 그린 이미지/비디오 프레임
- 이미지로부터 추출하는 CSS Shapes

`교차 출처 공유 표준` 은 웹 브라우저에서 해당 정보를 읽는 것이 허용된 출처를 서버에서 설명할 수 있는 새로운 `HTTP 헤더` 를 추가함으로써 동작한다. 추가적으로, 서버 데이터에 `Side Effect` 를 일으킬 수 있는 HTTP 요청 메서드 (`GET` 을 제외한 `HTTP 메서드`)에 대해, CORS 명세는 브라우저가 요청을 `OPTIONS` 메서드로 `Preflight (사전 전달)` 하여 지원하는 메서드를 요청하고, 서버의 `허가` 가 떨어지면 실제 요청을 보내도록 요구하고 있다. 또한 서버는 클라이언트에게 요청에 `인증정보 (쿠기, HTTP 인증)` 를 함께 보내야 한다고 알려줄 수도 있다.

CORS 실패는 오류의 원인이지만, 보안상의 이유로 JavaScript에서는 오류의 상세 정보에 접근할 수 없으며, 알 수 있는 것은 오류가 발생했다는 사실 뿐이다. 정확히 어떤 것이 실패했는지 알아내려면 브라우저의 콘솔을 봐야 한다.

## 접근 제어 시나리오

### 단순 요청 (Simple Request)

일부 요청은 `CORS Preflight` 를 트리거하지 않는다. `Simple Request` 는 다음 조건을 모두 충족하는 요청이다.

- 다음 중 하나의 메서드
  - `GET`
  - `HEAD`
  - `POST`
- 유저 에이전트가 자동으로 설정 한 헤더 (ex) Connection, User-Agent (en-US), Fetch 명세에서 "forbidden header name" 으로 정의한 헤더)외에, 수동으로 설정할 수 있는 헤더는 오직 Fetch 명세에서 "CORS-safelisted request-header"로 정의한 헤더 뿐이다.
  - `Accept`
  - `Accept-Language`
  - `Content-Language`
  - `Content-Type` (`Content-Type` 헤더는 다음의 값들만 허용된다.)
    - `application/x-www-form-urlencoded`
    - `multipart/form-data`
    - `text-plain`
- 요청에 사용된 `XMLHttpRequestUpload` 객체에는 이벤트 리스너가 등록되어 있지 않다. 이들은 `XMLHttpRequest.upload` 프로퍼티를 사용하여 접근한다.
- 요청에 `ReadableStream` 객체가 사용되지 않는다.

#### Example

`https://foo.example` 의 웹 컨텐츠가 `https://bar.other` 도메인의 컨텐츠를 호출하길 원하는 경우, 아래와 같은 코드가 될 수 있다.

```javascript
const xhr = new XMLHttpRequest();
const url = 'https://bar.other/resources/public-data/';

xhr.open('GET', url);
xhr.onreadystatechange = someHandler;
xhr.send();
```

클라이언트와 서버간에 간단한 통신을 하고, CORS 헤더를 사용하여 권한을 처리한다.

이 경우 브라우저가 서버로 전송하는 내용을 살펴보고, 서버의 응답을 확인한다.

```
GET /resources/public-data/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: https://foo.example
```

요청 헤더의 `Origin` 을 보면, `https://foo.example` 로부터 요청이 왔다는 것을 알 수 있다.

```
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 00:23:53 GMT
Server: Apache/2
Access-Control-Allow-Origin: *
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Transfer-Encoding: chunked
Content-Type: application/xml

[...XML Data...]
```

서버는 이에 대한 응답으로 `Access-Control-Allow-Origin` 헤더를 다시 전송한다. 가장 간단한 접근 제어 프로토콜은 `Origin` 헤더와 `Access-Control-Allow-Origin` 을 사용하는 것이다. 이 경우 서버는 `Access-Control-Allow-Origin: *` 으로 응답해야 하며, 이는 `모든` 도메인에서 접근할 수 있음을 의미한다.

### 프리플라이트 요청

`Preflighted request` 는 먼저 `OPTIONS` 메서드를 통해 다른 도메인의 리소스로 HTTP 요청을 보내 실제 요청이 전송하기에 안전한지 확인한다. `Cross-site` 요청은 유저 데이터에 영향을 줄 수 있기 때문에 이와 같이 미리 전송(Preflighted)한다.

#### Example

```javascript
const xhr = new XMLHttpRequest();

xhr.open('POST', 'https://bar.other/resources/post-here/');
xhr.setRequestHeader('Ping-Other', 'pingpong');
xhr.setRequestHeader('Content-Type', 'application/xml');
xhr.onreadystatechange = handler;
xhr.send('<person><name>Arun</name></person>');
```

Content-Type이 `application/xml` 이고, 사용자 정의 헤더 `Ping-Other` 가 설정되었기 때문에 이 요청은 Preflighted 처리된다.

첫 번째 통신은 preflight request/response 이다.

```
OPTIONS /resources/post-here/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: http://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type


HTTP/1.1 204 No Content
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
Vary: Accept-Encoding, Origin
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
```

1 - 10 행은 `OPTIONS` 메서드를 사용한 `preflight request` 를 나타낸다. `OPTIONS` 요청과 함께 두 개의 다른 요청 헤더가 전송된다.

```
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type
```

:::tip OPTIONS
`OPTIONS` 는 서버에서 추가 정보를 판별하는데 사용하는 HTTP/1.1 메서드이다.
safe 메서드이기 때문에, 리소스를 변경하는데 사용할 수 없다.
:::

- **Access-Control-Request-Method**
  - `preflight request` 의 일부로, 실제 요청을 전송할 때 `POST` 메서드로 전송된다는 것을 알려준다.
- **Access-Control-Request-Headers**
  - 실제 요청을 전송할 때 `X-PINGOTHER` 와 `Content-Type` 사용자 정의 헤더와 함께 전송된다는 것을 서버에 알려준다.

서버는 이러한 상황에서 요청을 수락할지 결정할 수 있다.

13 - 22 행은 서버가 요청 메서드와 (POST) 요청 헤더를 (X-PINGOTHER) 받을 수 있음을 나타내는 응답이다.

```
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
```

- **Access-Control-Allow-Methods**

  - 서버는 `Access-Control-Allow-Methods` 로 응답하고 `POST` 와 `GET` 이 리소스를 쿼리하는데 유용한 메서드라고 가르쳐준다.

  > 이 헤더는 `Allow` 응답 헤더와 유사하지만, 접근 제어 컨텍스트 내에서 엄격하게 사용된다.

  :::tip Allow
  `Allow` 헤더는 리소스가 지원하는 메소드 집합을 나열한다.

  [Allow - MDN](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Allow)
  :::

- **Access-Control-Allow-Headers**

  - `Access-Control-Allow-Headers` 의 값을 `X-PINGOTHER, Content-Type` 으로 전송하여 실제 요청에 사용할 수 있음을 확인한다.

- **Access-Control-Max-Age**

  - 다른 `preflight request` 를 보내지 않고, `preflight request` 에 대한 응답을 캐시할 수 있는 시간(초)을 제공한다.
  - 각 브라우저의 최대 캐싱 시간은 `Access-Control-Max-Age` 가 클수록 우선순위가 높다.

preflight request가 완료되면 실제 요청을 전송한다.

```
POST /resources/post-here/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
X-PINGOTHER: pingpong
Content-Type: text/xml; charset=UTF-8
Referer: https://foo.example/examples/preflightInvocation.html
Content-Length: 55
Origin: https://foo.example
Pragma: no-cache
Cache-Control: no-cache

<person><name>Arun</name></person>


HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:40 GMT
Server: Apache/2
Access-Control-Allow-Origin: https://foo.example
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 235
Keep-Alive: timeout=2, max=99
Connection: Keep-Alive
Content-Type: text/plain

[Some GZIP'd payload]
```

<!-- ### Preflighted requests 와 리다이렉트 -->

### 인증정보를 포함한 요청

`credentialed requests` 는 `XMLHttpRequest` 혹은 `Fetch` 를 사용할 때 CORS에 의해 드러나는 가장 흥미로운 기능이다. `credentialed requests` 는 HTTP cookies 와 HTTP Authentication 정보를 인식한다. 기본적으로 cross-site `XMLHttpRequest` 나 `Fetch` 호출에서 브라우저는 자격 증명을 보내지 않는다. `XMLHttpRequest` 객체나 `Request` 생성자가 호출될 때 특정 플래그를 설정해야 한다.

#### Example

`http://foo.example` 에서 불러온 컨텐츠는 쿠키를 설정하는 `http://bar.other` 리소스에 simple GET request를 작성한다.

```javascript
const invocation = new XMLHttpRequest();
const url = 'http://bar.other/resources/credentialed-content/';

function callOtherDomain() {
  if (invocation) {
    invocation.open('GET', url, true);
    invocation.withCredentials = true;
    invocation.onreadystatechange = handler;
    invocation.send();
  }
}
```

7행은 쿠키와 함께 호출하기위한 `XMLHttpRequest` 의 플래그(`withCredentials`)를 보여준다. 기본적으로 호출은 쿠키 없이 이루어지며, 이것은 simple GET request 이므로 preflighted 되지 않는다. 그러나 브라우저는`Access-Control-Allow-Credentials: true` 헤더가 없는 응답을 거부한다. 따라서 호출된 웹 컨텐츠에 응답을 제공하지 않는다.

```
GET /resources/credentialed-content/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Referer: http://foo.example/examples/credential.html
Origin: http://foo.example
Cookie: pageAccess=2


HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:34:52 GMT
Server: Apache/2
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Credentials: true
Cache-Control: no-cache
Pragma: no-cache
Set-Cookie: pageAccess=3; expires=Wed, 31-Dec-2008 01:34:53 GMT
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 106
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain


[text/plain payload]
```

10행에는 `http://bar.other` 의 컨텐츠를 대상으로 하는 쿠키가 포함되어 있다. 그러나 17행의 `Access-Control-Allow-Credentials: true` 로 응답하지 않으면, 응답을 무시되고 웹 컨텐츠는 제공되지 않는다.

#### 실행 전 요청 및 자격 증명

CORS 실행 전 요청에는 자격 증명이 포함되지 않아야 한다. 실행 전 요청에 대한 응답은 `Access-Control-Allow-Credentials: true` 를 지정하여 자격 증명으로 실제 요청을 수행할 수 있음을 나타내야 한다.

#### 자격 증명 요청 및 와일드카드(Credentialed requests and wildcards)

자격 증명 요청에 응답할 때 서버는 반드시 `*` 와일드카드를 지정하는 대신 `Access-Control-Allow-Origin` 헤더 값에 출처를 지정해야 한다.

위 예제에서 요청 헤더에 `Cookie` 헤더가 포함되어 있기 때문에 `Access-Control-Allow-Origin` 헤더의 값이 `*` 인 경우 요청이 실패한다. 위 요청은 `Access-Control-Allow-Origin` 헤더가 `https://foo.example` 이기 때문에 자격 증명 인식 컨텐츠는 웹 호출 컨텐츠로 리턴된다.

위 예제의 `Set-Cookie` 응답 헤더는 추가 쿠키를 생성한다.

##### Third-party cookies

CORS 응답에 설정된 쿠키에는 일반적인 `third-party cookie` 정책이 적용된다.

위의 예제는 `foo.example` 에서 페이지를 불러오지만 20행의 쿠키는 `bar.other` 가 전송한다. 따라서 사용자의 브라우저 설정이 모든 `third-party cookie` 를 거부하도록 되어 있다면, 이 쿠키는 저장되지 않는다.

## HTTP 응답 헤더

서버가 접근 제어 요청을 위해 보내는 HTTP 응답 헤더

### Access-Control-Allow-Origin

```
Access-Control-Allow-Origin: <origin> | *
```

단일 출처를 지정하여 브라우저가 해당 출처가 리소스에 접근하도록 허용한다.

자격 증명이 없는 요청의 경우 `*` 와일드카드는 브라우저의 origin에 상관없이 모든 리소스에 접근하도록 허용한다.

서버가 `*` 와일드카드 대신에 하나의 origin을 지정하는 경우, 서버는 `Vary` 응답 헤더에 `Origin` 을 포함해야 한다.

:::tip Vary
`Vary` 헤더는 캐시 된 응답을 향후 요청들에서 오리진 서버로 새로운 요청 헤더를 요청하는 대신 사용할 수 있는지 여부를 결정한다.

[Vary - MDN](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Allow)
:::

### Access-Control-Expose-Headers

브라우저가 접근할 수 있는 헤더를 서버의 화이트리스트에 추가할 수 있다.

```
Access-Control-Expose-Headers: <header-name>[, <header-name>]*
```

### Access-Control-Max-Age

preflight request 요청 결과를 캐시할 수 있는 시간을 나타낸다.

```
Access-Control-Max-Age: <delta-seconds>
```

### Access-Control-Allow-Credentials

`credentials` 플래그가 `ture` 일 때, 요청에 대한 응답을 표시할 수 있는지를 나타낸다.

preflight request에 대한 응답의 일부로 사용하는 경우, credentials을 사용하여 실제 요청을 수행할 수 있는지를 나타낸다.

simple GET requests는 preflighted되지 않으므로 credentials이 있는 리소스를 요청하면, 이 헤더가 리소스와 함께 반환되지 않습니다. 이 헤더가 없으면 브라우저에서 응답을 무시하고 웹 컨텐츠로 반환되지 않는다.

```
Access-Control-Allow-Credentials: true
```

### Access-Control-Allow-Methods

리소스에 접근할 때 허용되는 메서드를 지정한다. 이 헤더는 preflight request에 대한 응답으로 사용된다.

```
Access-Control-Allow-Methods: <method>[, <method>]*
```

### Access-Control-Allow-Headers

`preflight request` 에 대한 응답으로 사용된다. 실제 요청시 사용할 수 있는 HTTP 헤더를 나타낸다.

```
Access-Control-Allow-Headers: <header-name>[, <header-name>]*
```

## HTTP 요청 헤더

cross-origin 공유 기능을 사용하기 위해 클라이언트가 HTTP 요청을 발행할 때 사용할 수 있는 헤더

### Origin

cross-site 접근 요청 또는 preflight request의 출처를 나타낸다.

```
Origin: <origin>
```

origin은 요청이 시작된 서버를 나타내는 URI 이다. 경로 정보는 포함하지 않고, 오직 서버 이름만 포함한다.

> origin 값은 `null` 또는 `URI` 가 올 수 있다.

### Access-Control-Request-Method

실제 요청에서 어떤 HTTP 메서드를 사용할지 서버에게 알려주기 위해, preflight request 할 때에 사용된다.

```
Access-Control-Request-Method: <method>
```

### Access-Control-Request-Headers

실제 요청에서 어떤 HTTP 헤더를 사용할지 서버에게 알려주기 위해, preflight request 할 때에 사용된다.

```
Access-Control-Request-Headers: <field-name>[, <field-name>]*
```

## References

[교차 출처 리소스 공유 (CORS) - MDN](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS#origin)
