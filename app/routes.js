module.exports = function(app, passport) {
	var categoryCtrl = require("./controllers/contr-category.js");
	var postCtrl = require("./controllers/contr-post.js");
	var userCtrl = require("./controllers/contr-user.js");
	var notificationCtrl = require("./controllers/contr-notifications.js");

	// ============================================================================
	// PAGES ROUTES ===============================================================
	// ============================================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		if (req.user) {
			req.user.getCount(function(u) {
				res.render('v-list.ejs', {
					user: req.user,
					nCount: u
				});
			});
		}
		else {
			res.render('v-list.ejs', {
				user: null,
				nCount: null
			});
		}
	});

	// PROFILE SECTION =========================
	app.get('/settings', isLoggedIn, function(req, res) {
		req.user.getCount(function(u) {
			res.render('v-settings.ejs', {
				user: req.user,
				nCount: u
			});
		});
	});

	// NEW POST =================================
	app.get('/newpost', isLoggedIn, function(req, res) {
		req.user.getCount(function(u) {
			res.render('v-newpost.ejs', {
				user: req.user,
				nCount: u
			});
		});
	});


	// DISPLAY SINGLE POST =========================

	app.get('/post', function(req, res) {

		if (req.user) {
			req.user.getCount(function(u) {
				res.render('v-singlePost.ejs', {
					user: req.user,
					nCount: u
				});
			});
		}
		else {
			res.render('v-singlePost.ejs', {
				user: null,
				nCount: null
			});
		}
	});

	// CATEGORY MANAGEMENT =========================
	app.get('/category', isLoggedIn, function(req, res) {
		req.user.getCount(function(u) {
			res.render('v-category.ejs', {
				user: req.user,
				nCount: u
			});
		});
	});

	// DISPLAY LIST OF POSTST PER CATEGORY =========

	app.get('/list', function(req, res) {
		if (req.user) {
			req.user.getCount(function(u) {
				res.render('v-list.ejs', {
					user: req.user,
					nCount: u
				});
			});
		}
		else {
			res.render('v-list.ejs', {
				user: null,
				nCount: null
			});
		}
	});

	// DISPLAY LIST OF POSTST PER CATEGORY =========

	app.get('/myList', function(req, res) {
		if (req.user) {
			req.user.getCount(function(u) {
				res.render('v-myList.ejs', {
					user: req.user,
					nCount: u
				});
			});
		}
		else {
			res.render('v-list.ejs', {
				user: null,
				nCount: null
			});
		}
	});

	// DISPLAY SEARCH RESULTS
	app.get("/search", function(req, res) {
		if (req.user) {
			req.user.getCount(function(u) {
				res.render('v-search.ejs', {
					user: req.user,
					nCount: u
				});
			});
		}
		else {
			res.render('v-search.ejs', {
				user: null,
				nCount: null
			});
		}
	});

	// DISPLAY NOTIFICATIONS
	app.get("/notifications", isLoggedIn, function(req, res) {
		req.user.getCount(function(u) {
			res.render('v-notifications.ejs', {
				user: req.user,
				nCount: u
			});
		});
	});

	// PAGE NOT FOUND --------------------------
	app.get('/404', function(req, res) {
		res.render('notfound.ejs');
	});


	// ============================================================================
	// API ROUTES =================================================================
	// ============================================================================

	//USEERS
	app.get('/api/users', function(req, res) {
		userCtrl.getAllUsers(req, res);
	});
	
	app.put('/api/user/changedname', function(req,res){
		userCtrl.changeDisplayname(req,res);
	});
	
	app.put('/api/user/changepass', function(req,res){
		req.check('newPass', 'New password does not math minimum requirements.').isLength({min: 7}).isAlphanumeric();
		userCtrl.changePass(req,res);
	});

	//POST API
	//search posts
	app.get('/api/post/find/:search', function(req, res) {
		postCtrl.findp(req, res);
	});

	//add a new post
	app.post('/api/post', function(req, res) {
		postCtrl.newPost(req, res);
	});

	//get posts per user
	app.get('/api/post/myposts', function(req, res) {
		console.log("here")
		postCtrl.myPosts(req, res);
	});

	//get post by ID
	app.get('/api/post/:id', function(req, res) {
		postCtrl.getPost(req, res);
	});
	//upvote post by ID
	app.get('/api/post/upvote/:pid', function(req, res) {
		postCtrl.upvote(req, res);
	});
	//downvote post by ID
	app.get('/api/post/downvote/:pid', function(req, res) {
		postCtrl.downvote(req, res);
	});
	//delete the post
	app.delete('/api/post/:id', function(req, res) {
		postCtrl.pdel(req, res);
	});
	//update the post which has been already commented
	app.put('/api/post/update/:id', function(req, res) {
		postCtrl.pupd(req, res);
	});
	//update post's text before it has been comented on
	app.put('/api/post/edit/:id', function(req, res) {
		postCtrl.pedit(req, res);
	});

	//get posts by categoryID
	app.get('/api/post/byCat/:id', function(req, res) {
		postCtrl.postByCat(req, res);
	});

	//request access to public closed group
	app.post('/api/post/reqaccess/:id', function(req, res) {
		postCtrl.reqAccess(req, res);
	});

	//change privacy settings
	app.post('/api/post/:id/settings/privacy', function(req, res) {
		postCtrl.changePrivSett(req, res);
	});

	//apply encryption
	app.put('/api/post/:id/encrypt', function(req, res) {
		postCtrl.applyEncryption(req, res);
	});

	//remove encryption
	app.put('/api/post/:id/decrypt', function(req, res) {
		postCtrl.removeEncryption(req, res);
	});

	//REPLY API

	//upvote reply by ID
	app.get('/api/post/reply/upvote/:rid', function(req, res) {
		postCtrl.upvoteRep(req, res);
	});
	//downvote reply
	app.get('/api/post/reply/downvote/:rid', function(req, res) {
		postCtrl.downvoteRep(req, res);
	});
	//add new reply
	app.post('/api/post/prep/:id', function(req, res) {
		postCtrl.prep(req, res);
	});
	//add new comment to reply
	app.post('/api/post/rrep/:id', function(req, res) {
		postCtrl.rrep(req, res);
	});
	//delete reply
	app.delete('/api/post/:pid/reply/:rid', function(req, res) {
		postCtrl.rdel(req, res);
	});
	//delete reply comment
	app.delete('/api/post/rreply/:id/:pid', function(req, res) {
		postCtrl.rrdel(req, res);
	});
	//edit reply
	app.put('/api/post/reply/edit/:id', function(req, res) {
		postCtrl.redit(req, res);
	});

	//CATEGORY API

	app.delete('/api/category/:id', function(req, res) {
		categoryCtrl.removeCategory(req, res);
	});

	app.post('/api/category', function(req, res) {
		categoryCtrl.addCategoty(req, res);
	});

	app.get('/api/category/getParents/:id', function(req, res) {
		categoryCtrl.getParents(req, res);
	});

	//NOTIFICATIONS API

	app.get('/api/notifications/:user', function(req, res) {
		notificationCtrl.getByUser(req, res);
	});

	app.post('/api/notifications/:id/inviteAccept', function(req, res) {
		notificationCtrl.acceptInvitation(req, res);
	});

	app.post('/api/notifications/:id/inviteDecline', function(req, res) {
		notificationCtrl.declineInvitation(req, res);
	});

	app.post('/api/notifications/denyPostAccess/:id', function(req, res) {
		notificationCtrl.denyPostAccess(req, res);
	});

	app.post('/api/notifications/allowPostAccess/:id', function(req, res) {
		notificationCtrl.allowPostAccess(req, res);
	});

	app.put('/api/notification/read/:id', function(req, res) {
		notificationCtrl.read(req, res);
	});

	app.delete('/api/notification/:id', function(req, res) {
		notificationCtrl.delete(req, res);
	});

	app.post('/api/user/:user/invite/post/:pid', function(req, res) {
		notificationCtrl.inviteUser(req, res);
	});

	//LOGOUT

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// =============================================================================
	// AUTHENTICATE (FIRST LOGIN) ==================================================
	// =============================================================================

	// locally --------------------------------
	// LOGIN ===============================
	// show the login form
	app.get('/login', function(req, res) {
		if (req.user) {
			req.user.getCount(function(u) {
				res.render('v-list.ejs', {
					user: req.user,
					nCount: u
				});
			});
		}
		else {
			res.render('login.ejs', {
				user: null,
				nCount: null,
				message: req.flash('loginMessage')
			});
		}
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/list', // redirect to the secure profile section
		failureRedirect: '/login', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

	// SIGNUP =================================
	// show the signup form
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('loginMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/list', // redirect to the secure profile section
		failureRedirect: '/signup', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

	// facebook -------------------------------

	// send to facebook to do the authentication
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/list',
			failureRedirect: '/'
		}));

	// google ---------------------------------

	// send to google to do the authentication
	app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback',
		passport.authenticate('google', {
			successRedirect: '/list',
			failureRedirect: '/'
		}));

	// =============================================================================
	// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
	// =============================================================================

	// locally --------------------------------
	app.get('/connect/local', function(req, res) {
		res.render('connect-local.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect: '/settings', // redirect to the secure profile section
		failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

	// facebook -------------------------------

	// send to facebook to do the authentication
	app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

	// handle the callback after facebook has authorized the user
	app.get('/connect/facebook/callback',
		passport.authorize('facebook', {
			successRedirect: '/settings',
			failureRedirect: '/'
		}));


	// google ---------------------------------

	// send to google to do the authentication
	app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

	// the callback after google has authorized the user
	app.get('/connect/google/callback',
		passport.authorize('google', {
			successRedirect: '/settings',
			failureRedirect: '/'
		}));

	// =============================================================================
	// UNLINK ACCOUNTS =============================================================
	// =============================================================================
	// used to unlink accounts. for social accounts, just remove the token
	// for local account, remove email and password
	// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user = req.user;
		//user.local.uname    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/settings');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/settings');
		});
	});


	// google ---------------------------------
	app.get('/unlink/google', function(req, res) {
		var user = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/settings');
		});
	});

	app.use(function(req, res, next) {
		res.status(404).render("notfound.ejs")
	})

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/login');
}
