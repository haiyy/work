FROM reg.xiaoneng.cn/alpine/nginx:1.10

COPY dist /opt/nginx

COPY nginx_client.conf /etc/nginx/conf.d/

RUN mkdir -p /opt/logs

WORKDIR /opt/nginx/
EXPOSE 80

COPY docker-entrypoint.sh /opt/

#ENTRYPOINT ["/bin/sh", "/opt/docker-entrypoint.sh"]
RUN chmod a+x /opt/docker-entrypoint.sh
ENTRYPOINT ["/opt/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
