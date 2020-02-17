
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route')

Route.get('/', 'HomeController.index').as('welcomePage')
Route.post('/simpan', 'HomeController.postSimpan').as('Link.store')
Route.get('/list', 'HomeController.listLink')
Route.get('/link-detail/:docID', 'HomeController.linkDetail')
