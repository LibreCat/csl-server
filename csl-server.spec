Name: csl-server
Summary: node.js based Citation Style Language service
License: bsd
Version: 0.1
Release: X
BuildArch: noarch
BuildRoot: %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
Requires: nodejs,npm,shadow-utils
Source: %{name}.tar.gz

%description

%prep
%setup -q -n %{name}

%build
echo "nothing to build"

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}/opt/%{name}
mkdir -p %{buildroot}/etc/init.d
mkdir -p %{buildroot}/var/log/%{name}
mkdir -p %{buildroot}/home/%{name}

cp -r $RPM_BUILD_DIR/%{name}/* %{buildroot}/opt/%{name}/
cp $RPM_BUILD_DIR/%{name}/init.d/%{name} %{buildroot}/etc/init.d/%{name}

echo "Complete!"

%clean
rm -rf %{buildroot}

%files
%defattr(-,root,root,-)
/opt/%{name}/
/etc/init.d/%{name}
/var/log/%{name}
/home/%{name}

%doc

%pre
getent group %{name} >/dev/null || groupadd -r %{name}
getent passwd %{name} >/dev/null || useradd -r -g %{name} \
    -d /home/%{name} -s /sbin/nologin -c "CSL server user" %{name}

#in case of an upgrade (first installs new version, then deletes old version)
has_service=$(chkconfig --list | grep %{name})
if [ "$has_service" != "" ];then
  service %{name} stop &> /dev/null
  chkconfig --del %{name} &> /dev/null
fi

exit 0

%post
(
cd /opt/%name &&
npm install jsbin &&
npm install connect &&
mkdir -p /var/log/%{name}/ &&
test -d /var/log/%{name}/ &&
chown -R csl-server:csl-server /var/log/%{name} &&
chmod +x /etc/init.d/%{name} &&
chkconfig --add %{name} && chkconfig --level 345 %{name} on && service %{name} start &&
echo "service %{name} installed!"
) || exit 1

%preun
if [ "$1" = 0 ] ; then
  service %{name} stop &> /dev/null
  chkconfig --del %{name} &> /dev/null
  echo "service %{name} removed"
fi
exit 0

%postun
if [ "$1" -ge 1 ]; then
  service %{name} restart &> /dev/null
fi
exit 0

%changelog
