const router = require('express').Router()
const User = require('../models/user.model')
const mongoose = require('mongoose')
const { roles } = require('../utils/constants')

router.get("/users", async(req, res, next) => {
  try{
    const users = await User.find()
    res.render('manage-users', {users})
  }catch(e){
    next(e)
  }
})

router.get("/user/:id", async(req, res, next) =>{
  try{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
      res.redirect('/admin/users')
      return
    }
    const person = await User.findById(id)
    res.render('profile', {person})
  }catch(e){
    next(e)
  }
})

router.post("/update-role", async(req, res, next) => {
  try{
    const { id, role } = req.body;

    // Checking for id and roles in req.body
    if (!id || !role) {
      return res.redirect('back');
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      return res.redirect('back');
    }

    // Admin cannot remove itself as an admin
    if (req.user.id === id) {
      return res.redirect('back');
    }

    // update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );
    res.redirect('back');
  }catch(e){
    next(e)
  }
})

module.exports = router


