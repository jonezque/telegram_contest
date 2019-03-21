
ready(init);

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    //  fn();
    } else {
 //     document.addEventListener('DOMContentLoaded', fn);
    }
}

class GraphWidget {
    constructor(x, y, id) {        
        this.paddingX = 2;
        this.dataX = x.slice(1); 
        this.dataY = y.map(data => data.slice(1));
        this.namespace = 'tele_' + id;
    }

    mount(el) {
        const app = document.createElement('div');
        app.appendChild(this.createUpperGraph());
        app.appendChild(this.createLowerGraph());
        app.appendChild(this.createButtons());
        document.querySelector(el).appendChild(app);
    }

    createUpperGraph() {
        const header = document.createElement('header');
        const strong = document.createElement('strong');
        strong.textContent = 'Followers';

        const content = document.createElement('div');
        content.classList.add('content');

        const upper = document.createElement('div');
        upper.classList.add('upper', 'green');
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttributeNS(null, 'width', '100%');
        svg.setAttributeNS(null, 'height', '100%');
        svg.setAttributeNS(null, 'viewBox', '0 0 100 100');
        svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttributeNS(null, 'id', this.namespace + 'upperLines');

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        rect.setAttributeNS(null, 'width', '100');
        rect.setAttributeNS(null, 'height', '100');
        rect.setAttributeNS(null, 'x', '0');
        rect.setAttributeNS(null, 'y', '0');
        rect.setAttributeNS(null, 'opacity', '0.1');
        rect.setAttributeNS(null, 'fill', 'white');
        
        g.appendChild(rect);
        svg.appendChild(g);
        header.appendChild(strong);
        content.appendChild(upper);
        content.appendChild(svg);
        content.appendChild(header);

        return content;
    }

    createLowerGraph() {
        const lower = document.createElement('div');
        lower.classList.add('lower');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttributeNS(null, 'width', '100%');
        svg.setAttributeNS(null, 'height', '100%');
        svg.setAttributeNS(null, 'viewBox', '0 0 100 100');
        svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
        svg.setAttributeNS(null, 'id', this.namespace + 'lowerChart');
        
        const g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const g2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g2.setAttributeNS(null, 'id', this.namespace + 'lines');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'id', this.namespace + 'brush');
        path.setAttributeNS(null, 'fill-rule', 'evenodd');
        path.setAttributeNS(null, 'fill', 'grey');
        path.setAttributeNS(null, 'opacity', 0.2);
        path.setAttributeNS(null, 'd', 'M0,0 h100 v100 h-100z M50,1 h30 v98 h-30z');

        const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect1.setAttributeNS(null, 'x', 50);
        rect1.setAttributeNS(null, 'y', 1);
        rect1.setAttributeNS(null, 'width', 30);
        rect1.setAttributeNS(null, 'height', 98);
        rect1.setAttributeNS(null, 'opacity', 0.01);
        rect1.setAttributeNS(null, 'fill', 'white');

        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttributeNS(null, 'x', 48);
        rect2.setAttributeNS(null, 'y', 1);
        rect2.setAttributeNS(null, 'width', 2);
        rect2.setAttributeNS(null, 'height', 98);
        rect2.setAttributeNS(null, 'opacity', 0.2);
        rect2.setAttributeNS(null, 'fill', 'black');

        const rect3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect3.setAttributeNS(null, 'x', 80);
        rect3.setAttributeNS(null, 'y', 1);
        rect3.setAttributeNS(null, 'width', 2);
        rect3.setAttributeNS(null, 'height', 98);
        rect3.setAttributeNS(null, 'opacity', 0.2);
        rect3.setAttributeNS(null, 'fill', 'black');

        g1.appendChild(g2);
        g1.appendChild(rect1);
        g1.appendChild(rect2);
        g1.appendChild(rect3);
        svg.appendChild(g1);
        lower.appendChild(svg);
        
        return lower;
    }

    createButtons() {
        const group = document.createElement('div');
        group.classList.add('btn-group');

        return group
    }
}

function init() { 
    let selectedElement, offset, dataY, dataX, minX, maxX, minY, maxY;
    const paddingX = 2;

    const brush = document.querySelector('#brush');
    const innerBrush = document.querySelector('.inner-brush');
    const leftBrush = document.querySelector('.left-brush');
    const rightBrush = document.querySelector('.right-brush');    

    fetch('https://telegramcontest.firebaseio.com/data.json').then(response => response.json().then(data => {
        const graphData = 4;
        dataX = data[graphData].columns[0].slice(1);
        dataY = data[graphData].columns.slice(1);
        minX = dataX[0];
        maxX = dataX[dataX.length - 1];
        const totalY = dataY.reduce((acc, cur) => { acc.push(...cur.slice(1)); return acc; }, []);
        minY = Math.min(...totalY);
        maxY = Math.max(...totalY);
        dataY.forEach((arrY, idx) => {
                const { p1, p2 } = createPath(arrY.slice(1), data[graphData].colors['y' + idx], data[graphData].names['y' + idx]);
                document.querySelector('#lines').appendChild(p1);
                document.querySelector('#upperLines').appendChild(p2);
            }
        );

        transform();
        addCallback(data[graphData].names);
        addBrush();   
    }));

    function startDrag(evt) {
        if (evt.target.classList.contains('move')) {
            selectedElement = evt.target;
            offset = getMousePosition(evt);
            offset.x -= +selectedElement.getAttributeNS(null, 'x');
        }
    }

    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            const coord = getMousePosition(evt);
            const { min, max } = getLimit();
            const current = coord.x - offset.x < min ? min : coord.x - offset.x > max ? max : coord.x - offset.x;
            selectedElement.setAttributeNS(null, 'x', current);
            
            const xl = +leftBrush.getAttributeNS(null, 'x');
            const xr = +rightBrush.getAttributeNS(null, 'x');        

            if (selectedElement === innerBrush) {
                const w = +innerBrush.getAttributeNS(null, 'width');
                brush.setAttributeNS(null, 'd', `M0,0 h100 v100 h-100z M${current},1 h${w} v98 h-${w}z`);
                leftBrush.setAttributeNS(null, 'x', current - paddingX);
                rightBrush.setAttributeNS(null, 'x', current + w);
            } else {
                innerBrush.setAttributeNS(null, 'x', xl + paddingX);
                innerBrush.setAttributeNS(null, 'width', xr - xl - paddingX);
                brush.setAttributeNS(null, 'd', `M0,0 h100 v100 h-100z M${xl + paddingX},1 h${xr - xl - paddingX} v98 h-${xr - xl - paddingX}z`); 
            }  
            transform();                            
        }
    }

    function endDrag() {
        selectedElement = null;        
        scaleUpper();
    }

    function getMousePosition(evt) {
        const CTM = document.querySelector('#lowerChart').getScreenCTM();
        if (evt.touches) { 
            evt = evt.touches[0]; 
        }

        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    function getLimit() {
        let min = 0;
        let max = 100 - paddingX;
        if (selectedElement === leftBrush) {
            max = rightBrush.getAttributeNS(null, 'x') - 4 - paddingX;
        } else if (selectedElement === rightBrush) {
            min = +leftBrush.getAttributeNS(null, 'x') + 4 + paddingX;
        } else {
            min = paddingX;
            max = max - innerBrush.getAttributeNS(null, 'width');
        }

        return { min, max };
    }

    function createPath(y, color, text) {
        const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        redraw(p1, y, color, text);        
        redraw(p2, y, color, text, maxY, minY, true);
        addButton(color, text);
        return { p1, p2 };
    }

    function redraw(element, y, color, text, scaledMaxY = maxY, scaledMinY = minY, upper = false) {    
        const x = dataX.map(value => getX(maxX, minX, value));
        y = y.map(value => getY(scaledMaxY, scaledMinY, value));
        let d = `M${x[0]}, ${y[0]}`;
        for(let i = 1; i < x.length; i++) {
            d += `L${x[i]}, ${y[i]}`;        
        }

        if (!element.getAttributeNS(null, 'id')) {
            let add = '';
            let strokeWidth = 1.2;
            if (upper) {
                add = 'u';
                strokeWidth = 3;
            }

            element.setAttributeNS(null, 'd', d);
            element.setAttributeNS(null, 'id', 'y' + add + + text.slice(1));
            element.setAttributeNS(null, 'stroke', color);
            element.setAttributeNS(null, 'stroke-width', strokeWidth);
            element.setAttributeNS(null, 'fill', 'none');
            element.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
        } else {        
            animateLine(element, d);
        }
    }

    function animateLine(element, d) {
        const animate = element.querySelector('animate') || document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        let prev = animate.getAttributeNS(null, 'to');
        if (!prev) {
            prev = element.getAttributeNS(null, 'd');
            animate.setAttributeNS(null, 'attributeName', 'd');
            animate.setAttributeNS(null, 'dur', '0.2s');
            animate.setAttributeNS(null, 'repeatCount', '1');
            animate.setAttributeNS(null, 'fill', 'freeze');
            element.appendChild(animate);
        }
        
        animate.setAttributeNS(null, 'from', prev);
        animate.setAttributeNS(null, 'to', d);
        animate.beginElement();
    }

    function transform() {
        const l = +leftBrush.getAttributeNS(null, 'x') + paddingX / 2;
        const r = +rightBrush.getAttributeNS(null, 'x') +  paddingX / 2;
        const scale = 100/(r - l);
        const g = document.querySelector('#upperLines');
        g.setAttributeNS(null, 'transform', `scale(${scale} 1) translate(${-l} 0)`);
        
    }

    function getY(max, min, current) {
        return 100 - 1 - (current - min) / (max - min) * (100 - 2);
    }

    function getX(max, min, current) {
        return (current - min) / (max - min) * 98 + 1;
    }

    function addButton(color, text) {
        const button = document.createElement('button');
        button.setAttribute('id', 'b' + text.slice(1));
        button.classList.add('btn');
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttributeNS(null, 'viewBox', '0 0 20 20');
        svg.setAttributeNS(null, 'class', 'circle');
        
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS(null, 'href', '#circle');
        use.setAttributeNS(null, 'fill', color);
        use.setAttributeNS(null, 'stroke', color);
        
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttributeNS(null, 'attributeName', 'fill');
        animate.setAttributeNS(null, 'from', color);
        animate.setAttributeNS(null, 'begin', 'click');
        animate.setAttributeNS(null, 'dur', '0.2s');
        animate.setAttributeNS(null, 'repeatCount', '1');
        animate.setAttributeNS(null, 'fill', 'freeze');

        use.appendChild(animate);
        svg.appendChild(use);
        button.appendChild(svg);
        button.appendChild(document.createTextNode(text));
        document.querySelector('.btn-group').appendChild(button);
    }

    function addCallback() {
        document.querySelectorAll('.btn').forEach(btn => btn.addEventListener('click', function () {
            const off = this.classList.toggle('off');
            const id = this.getAttribute('id').slice(1);
            const lines = document.querySelectorAll('#y' + id + ', #yu' + id);
            if (off) {
                lines.forEach(line => line.setAttribute('style', 'display:none;'));
            } else {
                lines.forEach(line => line.setAttribute('style', ''));
            }
            
            scaleLower();
            scaleUpper();
            toggleButton(this, off);           
        }));
    }

    function toggleButton(element, off) {
        const a = element.querySelector('animate');
        const color = element.querySelector('use').getAttribute('fill');
        a.setAttribute('from', off ? color : 'white');
        a.setAttribute('to', off ? 'white' : color);
        a.beginElement();        
    }

    function scaleLower() {
        const nodes = document.querySelector('#lines').querySelectorAll('path:not([style*="display:none"])');
        const totalY = []
        for(let i = 0; i < nodes.length; i++) {
            const idx = +nodes[i].getAttributeNS(null,'id').slice(1);
            totalY.push(...dataY[idx].slice(1));
        }

        minY = Math.min(...totalY);
        maxY = Math.max(...totalY);        
        for(let i = 0; i < nodes.length; i++) {
            const idx = +nodes[i].getAttributeNS(null,'id').slice(1);
            redraw(nodes[i], dataY[idx].slice(1), null, null);
        } 
    }

    function scaleUpper() {
        const upperNodes = document.querySelector('#upperLines').querySelectorAll('path:not([style*="display:none"])');
        const totalScaledY = [];
        const l = +leftBrush.getAttributeNS(null, 'x') + paddingX / 2;
        const r = +rightBrush.getAttributeNS(null, 'x') + paddingX / 2;
        const x = dataX.map(value => getX(maxX, minX, value));
        const startIndex = x.findIndex(val => val > l);
        const endIndex = x.findIndex(val => val > r) === -1 ? x.length - 1: x.findIndex(val => val > r);

        for(let i = 0; i < upperNodes.length; i++) {
            const idx = +upperNodes[i].getAttributeNS(null,'id').slice(2);
            totalScaledY.push(...dataY[idx].slice(1).slice(startIndex, endIndex));
        }            
        
        const scaledMaxY = Math.max(...totalScaledY);
        const scaledMinY = Math.min(...totalScaledY);
        for(let i = 0; i < upperNodes.length; i++) {
            const idx = +upperNodes[i].getAttributeNS(null,'id').slice(2);
            redraw(upperNodes[i], dataY[idx].slice(1), null, null, scaledMaxY, scaledMinY, true);  
        } 
    }

    function addBrush() {
        document.querySelectorAll('.move').forEach(rect => {
            rect.addEventListener('mousedown', startDrag);
            rect.addEventListener('mousemove', drag);
            rect.addEventListener('mouseup', endDrag);
            rect.addEventListener('mouseleave', endDrag);            
            rect.addEventListener('touchstart', startDrag);
            rect.addEventListener('touchmove', drag);
            rect.addEventListener('touchend', endDrag);
            rect.addEventListener('touchleave', endDrag);
            rect.addEventListener('touchcancel', endDrag);
        });
    }
}