
### Theme资源名称：ww-zh/pb-web-slides(ppt)
网页版PPT，基于[reveal.js](https://github.com/hakimel/reveal.js)上实现的；节点中，一章PPT即是「PPT资源」,可支持展示多个PPT。

#### PPT资源
- 资源类型: reveal_slide
- 资源内容: HTML片段，一个section片段，即为一张PPT内容；示例如下
**具体配置方法可参考[reveal.js](https://github.com/hakimel/reveal.js)，于[https://slides.com/](https://slides.com/)可支持在线制作PPT**

```html
<div class="reveal">
  <div class="slides">
    <section>
      <div class="sl-block" data-block-type="image" data-block-id="3eb9e3d4466e44bed2befd870791b49b" style="min-width: 4px; min-height: 4px; width: 431px; height: 403px; left: 234px; top: 140px;">
        <div class="sl-block-content" style="z-index: 12;">
          <img data-freelog-resource="chtes/image04" style="" data-natural-width="932" data-natural-height="872">
        </div>
      </div>
    </section>
    <section>
        <div class="sl-block" data-block-type="text" style="width: 806px; left: 77px; top: 238px; height: auto;" data-block-id="edeb722ffd7edd7f4251d96cd05b6712">
            <div class="sl-block-content" data-placeholder-tag="h1" data-placeholder-text="Title Text">
                <h1>Freelog</h1>
            </div>
        </div>
    </section>
    <section data-transition="slide">
        The train goes on …
    </section>
    <section data-transition="zoom">
      <h2>This slide will override the presentation transition and zoom!</h2>
    </section>
    <section data-transition-speed="fast">
      <h2>Choose from three transition speeds: default, fast or slow!</h2>
    </section>
    <section data-transition="slide-in fade-out">
        and stops.
    </section>
    <section data-transition="fade-in slide-out">
        (Passengers entering and leaving)
    </section>
    <section data-transition="slide">
        And it starts again.
    </section>
  </div>
</div>
```
