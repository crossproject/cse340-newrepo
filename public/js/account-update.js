const accForm = document.querySelector("#accountUpdateForm")
  accForm.addEventListener("change", function () {
      const updateAccBtn = document.querySelector("#submitAccBtn")
      updateAccBtn.removeAttribute("disabled")
    })

const passForm = document.querySelector("#passwordUpdateForm")
passForm.addEventListener("change", function () {
  const updateAccBtn = document.querySelector("#submitPassBtn")
  updateAccBtn.removeAttribute("disabled")
})    