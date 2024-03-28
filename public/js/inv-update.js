const form = document.querySelector("#updateForm")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("#submitButton")
      updateBtn.removeAttribute("disabled")
    })