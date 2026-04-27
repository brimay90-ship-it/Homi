const fs = require('fs');
let code = fs.readFileSync('preview/app.js', 'utf8');

global.document = {
    getElementById: (id) => {
        if (!global.mockEls) global.mockEls = {};
        if (!global.mockEls[id]) global.mockEls[id] = { classList: { contains:()=>false, add:()=>{}, remove:()=>{} }, innerHTML: '', textContent: '', addEventListener: ()=>{} };
        return global.mockEls[id];
    },
    querySelectorAll: () => [],
    addEventListener: () => {}
};
global.navigator = { geolocation: false };

code += `
calView = 'week';
renderCalendar();
console.log('Week HTML length:', document.getElementById('calView').innerHTML.length);
console.log('Week HTML start:', document.getElementById('calView').innerHTML.substring(0, 50));

calView = 'day';
renderCalendar();
console.log('Day HTML length:', document.getElementById('calView').innerHTML.length);
console.log('Day HTML start:', document.getElementById('calView').innerHTML.substring(0, 50));
`;

try {
  eval(code);
} catch (e) {
  console.error('Runtime Error:', e);
}
