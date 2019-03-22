
ready(init);

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
}

function init() {
    fetch('https://telegramcontest.firebaseio.com/data.json').then(response => response.json().then(json => {
        json.forEach((data, idx) => {
            const w = new GraphWidget(data.columns,
                data.colors,
                data.names,
                idx);
            w.mount('#root');
        });
    }));    
}

class GraphWidget {
    constructor(data, colors, text, id) {        
        this.paddingX = 2;
        this.colors = Object.values(colors);
        this.names = Object.values(text);
        this.dataX = data[0].slice(1); 
        this.dataY = data.slice(1).map(data => data.slice(1));
        this.namespace = 'tele_' + id;
        this.minX = this.dataX[0];
        this.maxX = this.dataX[this.dataX.length - 1];

        const totalY = this.dataY.reduce((acc, cur) => { acc.push(...cur); return acc; }, []);
        this.minY = Math.min(...totalY);
        this.maxY = Math.max(...totalY);
        this.selectedElement = null;
    }

    mount(el) {
        this.app = document.createElement('div');
        this.app.appendChild(this.createUpperGraph());
        this.app.appendChild(this.createLowerGraph());
        this.app.appendChild(this.createButtons());
        document.querySelector(el).appendChild(this.app);
        
        this.brush = this.app.querySelector(this.byId('brush'));
        this.innerBrush = this.app.querySelector('.inner-brush');
        this.leftBrush = this.app.querySelector('.left-brush');
        this.rightBrush = this.app.querySelector('.right-brush');

        this.dataY.forEach((arr, idx) => {
            const { p1, p2 } = this.createPath(arr, this.colors[idx], this.names[idx]);
            this.app.querySelector(this.byId('lines')).appendChild(p1);
            this.app.querySelector(this.byId('upperLines')).appendChild(p2);
        });

        this.drawAxis();
        this.transform();
        this.addCallback();
        this.addBrush();
        this.scaleUpper(); 
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
        upper.appendChild(svg);
        header.appendChild(strong);
        content.appendChild(header);
        content.appendChild(upper);

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
        
        const brushWidth = 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'id', this.namespace + 'brush');
        path.setAttributeNS(null, 'fill-rule', 'evenodd');
        path.setAttributeNS(null, 'fill', 'grey');
        path.setAttributeNS(null, 'opacity', 0.2);
        path.setAttributeNS(null, 'd', `M0,0 h100 v100 h-100z M${brushWidth},1 h${100 - 2 * brushWidth} v98 h-${100 - 2 * brushWidth}z`);

        const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect1.setAttributeNS(null, 'x', 2);
        rect1.setAttributeNS(null, 'y', 1);
        rect1.setAttributeNS(null, 'width', 100 - 2 * brushWidth);
        rect1.setAttributeNS(null, 'height', 98);
        rect1.setAttributeNS(null, 'opacity', 0.01);
        rect1.setAttributeNS(null, 'fill', 'white');
        rect1.setAttributeNS(null, 'class', 'move inner-brush');

        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttributeNS(null, 'x', 0);
        rect2.setAttributeNS(null, 'y', 1);
        rect2.setAttributeNS(null, 'width', brushWidth);
        rect2.setAttributeNS(null, 'height', 98);
        rect2.setAttributeNS(null, 'opacity', 0.2);
        rect2.setAttributeNS(null, 'fill', 'black');
        rect2.setAttributeNS(null, 'class', 'move left-brush');

        const rect3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect3.setAttributeNS(null, 'x', 100 - brushWidth);
        rect3.setAttributeNS(null, 'y', 1);
        rect3.setAttributeNS(null, 'width', brushWidth);
        rect3.setAttributeNS(null, 'height', 98);
        rect3.setAttributeNS(null, 'opacity', 0.2);
        rect3.setAttributeNS(null, 'fill', 'black');
        rect3.setAttributeNS(null, 'class', 'move right-brush');

        g1.appendChild(g2);
        g1.appendChild(path);
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

    createPath(y, color, text) {
        const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.redraw(p1, y, color, text);        
        this.redraw(p2, y, color, text, this.maxY, this.minY, true);
        this.addButton(color, text);

        return { p1, p2 };
    }

    redraw(element, y, color, text, scaledMaxY = this.maxY, scaledMinY = this.minY, upper = false) {    
        const x = this.dataX.map(value => this.getX(this.maxX, this.minX, value));
        y = y.map(value => this.getY(scaledMaxY, scaledMinY, value));
        let d = `M${x[0]}, ${y[0]}`;
        for(let i = 1; i < x.length; i++) {
            d += `L${x[i]}, ${y[i]}`;        
        }
        
        const strokeWidth = upper ? 3 : 1.2;
        if (!element.getAttributeNS(null, 'd')) {
            element.setAttributeNS(null, 'd', d);
            element.setAttributeNS(null, 'data-idx', text.slice(1));
            element.setAttributeNS(null, 'stroke', color);
            element.setAttributeNS(null, 'stroke-width', strokeWidth);
            element.setAttributeNS(null, 'opacity', 0.9);
            element.setAttributeNS(null, 'fill', 'none');
            element.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
        } else {        
            this.animateLine(element, d);
        }

        if (upper) {
            this.drawPoints(x, y, element.getAttributeNS(null, 'stroke'));
        }
    }

    getY(max, min, current) {
        return 100 - 1 - (current - min) / (max - min) * (100 - 2);
    }

    getX(max, min, current) {
        return (current - min) / (max - min) * 98 + 1;
    }

    addButton(color, text) {
        const button = document.createElement('button');
        button.setAttribute('data-idx', text.slice(1));
        button.classList.add('btn');
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttributeNS(null, 'viewBox', '0 0 20 20');
        svg.setAttributeNS(null, 'class', 'circle');

        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttributeNS(null, 'attributeName', 'fill');
        animate.setAttributeNS(null, 'from', color);
        animate.setAttributeNS(null, 'begin', 'click');
        animate.setAttributeNS(null, 'dur', '0.2s');
        animate.setAttributeNS(null, 'repeatCount', '1');
        animate.setAttributeNS(null, 'fill', 'freeze');

        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttributeNS(null, 'cx', 10);
        c.setAttributeNS(null, 'cy', 10);
        c.setAttributeNS(null, 'r', 9);
        c.setAttributeNS(null, 'stroke-width', 2); 
        c.setAttributeNS(null, 'fill', color);
        c.setAttributeNS(null, 'stroke', color);

        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttributeNS(null, 'd', "M5 10 L9 14 L15 6");
        p.setAttributeNS(null, 'fill', 'none');
        p.setAttributeNS(null, 'stroke-linejoin', 'round');
        p.setAttributeNS(null, 'stroke-width', 2);   
        p.setAttributeNS(null, 'stroke', 'white');   
        p.setAttributeNS(null, 'stroke-linecap', 'round');
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.appendChild(c);
        g.appendChild(p);                    
        c.appendChild(animate);
        
        svg.appendChild(g);
        button.appendChild(svg);
        button.appendChild(document.createTextNode(text));
        this.app.querySelector('.btn-group').appendChild(button);
    }

    transform() {
        const l = +this.leftBrush.getAttributeNS(null, 'x') + this.paddingX / 2;
        const r = +this.rightBrush.getAttributeNS(null, 'x') +  this.paddingX / 2;
        const scale = 100/(r - l);
        const g = this.app.querySelector(this.byId('upperLines'));
        g.setAttributeNS(null, 'transform', `scale(${scale} 1) translate(${-l} 0)`);
                
        const scales = +this.innerBrush.getAttributeNS(null, 'width') + 4;
        const points = this.app.querySelectorAll(`ellipse`);
        for(let i = 0; i < points.length; i++) {
            points[i].setAttributeNS(null, 'rx', 1 * scales / 100);
        }   
    }

    byId(id) {
        return '#' + this.namespace + id;
    }

    addCallback() {
        const self = this;
        this.app.querySelectorAll('.btn').forEach(btn => btn.addEventListener('click', function () {
            const off = this.classList.toggle('off');
            const id = this.getAttribute('data-idx');
            const lines = self.app.querySelectorAll('path[data-idx="'+ id +'"]');
            if (off) {
                lines.forEach(line => line.setAttribute('style', 'display:none;'));
            } else {
                lines.forEach(line => line.setAttribute('style', ''));
            }
            
            self.scaleLower.call(self);
            self.scaleUpper.call(self);
            self.toggleButton(this, off);           
        }));
    }

    addBrush() {
        this.app.querySelectorAll('.move').forEach(rect => {
            rect.addEventListener('mousedown', this.startDrag.bind(this));
            rect.addEventListener('mousemove', this.drag.bind(this));
            rect.addEventListener('mouseup', this.endDrag.bind(this));
            rect.addEventListener('mouseleave', this.endDrag.bind(this));            
            rect.addEventListener('touchstart', this.startDrag.bind(this));
            rect.addEventListener('touchmove', this.drag.bind(this));
            rect.addEventListener('touchend', this.endDrag.bind(this));
            rect.addEventListener('touchleave', this.endDrag.bind(this));
            rect.addEventListener('touchcancel', this.endDrag.bind(this));
        });
    }

    startDrag(evt) {
        if (evt.target.classList.contains('move')) {
            this.selectedElement = evt.target;
            this.offset = this.getMousePosition(evt);
            this.offset.x -= +this.selectedElement.getAttributeNS(null, 'x');
        }
    }

    drag(evt) {
        if (this.selectedElement) {
            evt.preventDefault();
            const coord = this.getMousePosition(evt);
            const { min, max } = this.getLimit();
            const current = coord.x - this.offset.x < min ? min : coord.x - this.offset.x > max ? max : coord.x - this.offset.x;
            this.selectedElement.setAttributeNS(null, 'x', current);
            
            const xl = +this.leftBrush.getAttributeNS(null, 'x');
            const xr = +this.rightBrush.getAttributeNS(null, 'x');        

            if (this.selectedElement === this.innerBrush) {
                const w = +this.innerBrush.getAttributeNS(null, 'width');
                this.brush.setAttributeNS(null, 'd', `M0,0 h100 v100 h-100z M${current},1 h${w} v98 h-${w}z`);
                this.leftBrush.setAttributeNS(null, 'x', current - this.paddingX);
                this.rightBrush.setAttributeNS(null, 'x', current + w);
            } else {
                this.innerBrush.setAttributeNS(null, 'x', xl + this.paddingX);
                this.innerBrush.setAttributeNS(null, 'width', xr - xl - this.paddingX);
                this.brush.setAttributeNS(null, 'd', `M0,0 h100 v100 h-100z M${xl + this.paddingX},1 h${xr - xl - this.paddingX} v98 h-${xr - xl - this.paddingX}z`); 
            }  
            this.transform();
        }
    }

    endDrag() {
        if(this.selectedElement) {
            this.selectedElement = null;
            this.scaleUpper();
        }
    }

    getMousePosition(evt) {
        const CTM = this.app.querySelector(this.byId('lowerChart')).getScreenCTM();
        if (evt.touches) { 
            evt = evt.touches[0]; 
        }

        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    scaleUpper() {
        const upperNodes = this.app.querySelector(this.byId('upperLines')).querySelectorAll('path[data-idx]:not([style*="display:none"])');
        const totalScaledY = [];
        const l = +this.leftBrush.getAttributeNS(null, 'x') + this.paddingX / 2;
        const r = +this.rightBrush.getAttributeNS(null, 'x') + this.paddingX / 2;
        const x = this.dataX.map(value => this.getX(this.maxX, this.minX, value));
        const startIndex = x.findIndex(val => val > l);
        const endIndex = x.findIndex(val => val > r) === -1 ? x.length - 1: x.findIndex(val => val > r);

        for(let i = 0; i < upperNodes.length; i++) {
            const idx = +upperNodes[i].getAttributeNS(null,'data-idx');
            totalScaledY.push(...this.dataY[idx].slice(startIndex, endIndex));
        }            
        
        const scaledMaxY = Math.max(...totalScaledY);
        const scaledMinY = Math.min(...totalScaledY);
        for(let i = 0; i < upperNodes.length; i++) {
            const idx = +upperNodes[i].getAttributeNS(null,'data-idx');
            this.redraw(upperNodes[i], this.dataY[idx], null, null, scaledMaxY, scaledMinY, true);  
        }
         
        this.drawAxis(scaledMaxY, scaledMinY);        
        this.setYText(startIndex, endIndex); 
    }

    getLimit() {
        let min = 0;
        let max = 100 - this.paddingX;
        if (this.selectedElement === this.leftBrush) {
            max = this.rightBrush.getAttributeNS(null, 'x') - 4 - this.paddingX;
        } else if (this.selectedElement === this.rightBrush) {
            min = +this.leftBrush.getAttributeNS(null, 'x') + 4 + this.paddingX;
        } else {
            min = this.paddingX;
            max = max - this.innerBrush.getAttributeNS(null, 'width');
        }

        return { min, max };
    }

    animateLine(element, d) {
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

    scaleLower() {
        const nodes = this.app.querySelector(this.byId('lines')).querySelectorAll('path:not([style*="display:none"])');
        const totalY = []
        for(let i = 0; i < nodes.length; i++) {
            const idx = +nodes[i].getAttributeNS(null, 'data-idx');
            totalY.push(...this.dataY[idx]);
        }

        this.minY = Math.min(...totalY);
        this.maxY = Math.max(...totalY);        
        for(let i = 0; i < nodes.length; i++) {
            const idx = +nodes[i].getAttributeNS(null, 'data-idx');
            this.redraw(nodes[i], this.dataY[idx]);
        } 
    }

    toggleButton(element, off) {
        const a = element.querySelector('animate');
        const color = element.querySelector('circle').getAttribute('fill');
        a.setAttribute('from', off ? color : 'white');
        a.setAttribute('to', off ? 'white' : color);
        a.beginElement();      
    }

    drawAxis(max = this.maxY, min = this.minY) {
        const delta = max - min;
        const step = Math.floor(delta / 6);
        const g = this.app.querySelector(this.byId('upperLines'));
        const lines = g.querySelectorAll('path[data-axis]');

        if (!lines.length) {
            for(let i = 0; i < 6; i++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const y = i * step / delta * 100;
                line.setAttributeNS(null, 'd', `M0 ${(i + 1) / 6 * 100} h 100`);
                line.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
                line.setAttributeNS(null, 'opacity', 0.1);
                line.setAttributeNS(null, 'fill', 'none');
                line.setAttributeNS(null, 'stroke', 'black');
                line.setAttributeNS(null, 'data-axis', true);           
                
                g.appendChild(line);
                this.setXText(y, step, i , min);                
            }
        } else {
            for(let i = 0; i < lines.length; i++) {          
                const y = (i + 1) * step / delta * 100;
                this.setXText(y, step, i, min);
            }
        }        
    }
    
    setXText(y, step, idx, min) {
        let node = this.app.querySelector(`div[datax-idx="${idx}"]`);

        if (!node) {
            node = document.createElement('div');
            node.classList.add('label');
            node.style.bottom = y - 0.5 + '%';        
            node.setAttribute('datax-idx', idx);
            this.app.querySelector('.green').appendChild(node);
        }
        node.textContent =  step * (idx+1) + Math.floor(min);
    }

    setYText(from, to) {
        const delta = to - from;
        const step = delta / 6;
        const labels = [];
        for(let i = 0; i < 6; i++) {
            labels.push(this.toDateFormat(this.dataX[from + Math.floor(i * step)]));
        }

        let nodes = this.app.querySelectorAll(`div[datay-idx]`);

        if (!nodes.length) {
            for(let i = 0; i < 6; i++) {
                const node = document.createElement('div');
                node.classList.add('label');
                node.style.left = 100 / 6 * i + 2 + '%';
                node.style.bottom = '-16px';             
                node.setAttribute('datay-idx', 1);
                node.textContent = labels[i];
                this.app.querySelector('.green').appendChild(node);
            }
        } else {
            for(let i = 0; i < 6; i++) {
                nodes[i].textContent = labels[i];
            }
        } 
    }

    toDateFormat(date) {
        const d = new Date(date);
        const day = ('0' + d.getDate()).slice(-2);
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const year = d.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    }

    drawPoints(x, y, color) {
        const points = this.app.querySelectorAll(`ellipse[fill="${color}"]`);
        if(!points.length) {
            for(let i = 0; i < x.length; i++) {
                const c = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');                
                c.setAttributeNS(null, 'cx', x[i]);
                c.setAttributeNS(null, 'cy', y[i]);
                c.setAttributeNS(null, 'rx', 1);
                c.setAttributeNS(null, 'ry', 2);
                c.setAttributeNS(null, 'fill', color);
                c.setAttributeNS(null, 'opacity', 0);
                c.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');                       
                this.app.querySelector(this.byId('upperLines')).appendChild(c);
            }    
        } else {
            for(let i = 0; i < points.length; i++) {
                points[i].setAttributeNS(null, 'cy', y[i]);
            }
        }
    }
}