let $ = require('jquery');
let jQuery = require('jquery');
window.$ = $;
window.jQuery = jQuery;
let bootstrap = require('bootstrap');

$(function() {
    let renderLinks = function(links) {
        // last added, first shown
        links = links.reverse();

        let getLinkHtml = (link) => {
            return `
                <div class="col-xs-6 col-md-3">
                    <a href="${link.url}" class="thumbnail" data-toggle="tooltip" data-placement="top" title="${link.description}">
                        <img src="/images/shots/${link.shot}">
                    </a>
                    <div class="caption">
                        <h5>${link.title}</h5>
                    </div>
                </div>
            `;
        };

        for (let link of links) {
            // use title in case of missed description
            if ('undefined' === typeof link.description) {
                link.description = link.title;
            }

            $('.container .row').append(getLinkHtml(link));
        }

        $('.search-query').on('keyup', (event) => {
            let value = event.target.value.toLowerCase();

            if (13 == event.keyCode) {
                if ('' === value) {
                    return;
                }
                let firstElement = $('.row > div:visible').get(0);
                if (firstElement) {
                    $(firstElement).children('a').get(0).click();
                }
                return;
            }

            $.each(links, (index, item) => {
                let text = item.title + ' ' + item.url + ' ' + item.description;
                let toggle = (text.toLowerCase().indexOf(value) < 0 ? 'hide' : 'show');
                let currentElement = $($('.row > div').get(index));
                currentElement[toggle]();
            });
        });

        $('[data-toggle="tooltip"]').tooltip();
        $('.search-query').focus();
    };

    $.getJSON('/js/links.json')
        .done((data) => {
            renderLinks(data.links);
        })
        .fail(() => {
            $.getJSON('/js/links.example.json')
                .done((data) => {
                    renderLinks(data.links);
                });
        });
}());
