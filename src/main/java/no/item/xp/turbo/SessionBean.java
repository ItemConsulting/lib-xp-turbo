package no.item.xp.turbo;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

import javax.servlet.http.HttpServletRequest;
import java.util.function.Supplier;

public class SessionBean implements ScriptBean {
  private Supplier<PortalRequest> portalRequestSupplier;

  public String getId() {
    HttpServletRequest request = portalRequestSupplier
        .get()
        .getRawRequest();

    if (request != null) {
      return request.getSession(true).getId();
    } else {
      return null;
    }
  }

  @Override
  public void initialize(final BeanContext context) {
    this.portalRequestSupplier = context.getBinding(PortalRequest.class);
  }
}
