## Installation

Run the following commands:

```
git clone git@github.com:vinks/async_services.git
cd async_services
npm install
```

### Quickstart

For the quickest start, have [PM2](http://pm2.keymetrics.io) installed globally and then just type:

```
pm2 start async_services.json
```

End user interface will be available in [http://localhost:3000/view/a/b](http://localhost:3000/view/a/b) where a and b are job params

### Manual start

Run the admin interface:

```
node a_service/web
node b_service/web
node index
```
