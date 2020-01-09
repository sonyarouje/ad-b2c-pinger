FROM arm32v7/node:13-alpine
LABEL version=1.0.0

ENV USERNAME dev
RUN adduser -D -G root -u 1005 ${USERNAME}

ENV PORT 6420
ENV NODE_ENV DEV 
ENV SCHEDULED_HRS 7-22
ENV INTERVAL_IN_MIN 5
ENV CALL_SCHEDULED_URLS true
ENV SHOW_CONSOLE_LOG true
ENV CREATE_LOG_SYMLINK true
#EXPOSE ${PORT}

# uncomment if need bash
# RUN apk add --no-cache\
#     git \
#     bash

RUN apk add \
    git

COPY *.sh /
RUN chmod +x /entrypoint.sh \
    && chmod +x /get-source.sh    

USER $USERNAME

#set the npm global location for dev user
ENV NPM_CONFIG_PREFIX="/home/$USERNAME/.npm-global"

RUN mkdir -p ~/src \
    && mkdir ~/.npm-global \
    && mkdir ~/src/files \
    && mkdir ~/src/files/logs

#append the .npm-global to path, other wise globally installed packages will not be available in bash
ENV PATH="/home/$USERNAME/.npm-global:/home/$USERNAME/.npm-global/bin:${PATH}"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["--gitRepo","NOTSET"]