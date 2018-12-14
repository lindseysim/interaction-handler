require("jsdoc-to-markdown")
  .render({files: "interaction-handler.js"})
  .then(function(out) {
    require("fs").writeFile("API.md", out, (err)=>{ console.log(err); });
  })